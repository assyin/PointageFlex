#!/usr/bin/env python3
"""
ZKTeco Terminal Bridge - VERSION AMÉLIORÉE
Avec: Retry Logic, Circuit Breaker, Queue Locale
"""

import time
import requests
import json
import sys
from datetime import datetime, timedelta
from zk import ZK
from pathlib import Path
from functools import wraps

# =============================================================================
# CONFIGURATION
# =============================================================================
TERMINAL_IP = "192.168.16.174"  # À MODIFIER
TERMINAL_PORT = 4370
BACKEND_URL = "http://localhost:3000/api/v1/attendance/webhook"
DEVICE_ID = "TERMINAL-PRINC-001"  # À MODIFIER
TENANT_ID = "90fab0cc-8539-4566-8da7-8742e9b6937b"
CHECK_INTERVAL = 10
LOG_FILE = "C:\\Users\\yassi\\terminal1_improved.log"  # À MODIFIER
QUEUE_FILE = "C:\\Users\\yassi\\attendance_queue_t1.json"  # À MODIFIER

# Paramètres améliorés
TIMEOUT = 10  # Augmenté de 5s à 10s
MAX_RETRIES = 5
BASE_RETRY_DELAY = 2
CIRCUIT_BREAKER_THRESHOLD = 10
CIRCUIT_BREAKER_TIMEOUT = 60

# Employés à ignorer (si ce sont des tests)
IGNORED_EMPLOYEES = ["78", "80"]  # Optionnel

# Mapping des types de vérification
VERIFY_MODE_MAP = {
    0: "PIN_CODE",
    1: "FINGERPRINT",
    3: "FINGERPRINT",
    4: "FACE_RECOGNITION",
    15: "RFID_BADGE",
}

# =============================================================================
# LOGGING
# =============================================================================
def log(message):
    """Écrire dans le fichier de log"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{timestamp}] {message}\n")
    # Rotation: garder seulement les 1000 dernières lignes
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            lines = f.readlines()
        if len(lines) > 1000:
            with open(LOG_FILE, "w", encoding="utf-8") as f:
                f.writelines(lines[-1000:])
    except:
        pass

# =============================================================================
# CIRCUIT BREAKER
# =============================================================================
class CircuitBreaker:
    def __init__(self, failure_threshold=10, timeout=60):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func, *args, **kwargs):
        if self.state == "OPEN":
            if self.last_failure_time and time.time() - self.last_failure_time > self.timeout:
                self.state = "HALF_OPEN"
                log("🔄 Circuit breaker: Tentative de reconnexion...")
            else:
                log("🛑 Circuit breaker OPEN: Backend indisponible, attente...")
                return False
        
        try:
            result = func(*args, **kwargs)
            if result:
                self.on_success()
            else:
                self.on_failure()
            return result
        except Exception as e:
            self.on_failure()
            log(f"💥 Exception dans circuit breaker: {e}")
            return False
    
    def on_success(self):
        if self.state == "HALF_OPEN":
            log("✅ Circuit breaker: Backend rétabli, passage en CLOSED")
        self.failure_count = 0
        self.state = "CLOSED"
    
    def on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            if self.state != "OPEN":
                self.state = "OPEN"
                log(f"🛑 Circuit breaker OPEN après {self.failure_count} échecs consécutifs")

# Instance globale du circuit breaker
circuit_breaker = CircuitBreaker(
    failure_threshold=CIRCUIT_BREAKER_THRESHOLD,
    timeout=CIRCUIT_BREAKER_TIMEOUT
)

# =============================================================================
# RETRY LOGIC
# =============================================================================
def retry_with_backoff(max_retries=5, base_delay=2):
    """Décorateur pour retry avec exponential backoff"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except (requests.exceptions.RequestException, requests.exceptions.Timeout) as e:
                    retries += 1
                    if retries >= max_retries:
                        log(f"❌ Échec définitif après {max_retries} tentatives")
                        return False
                    
                    delay = base_delay * (2 ** (retries - 1))  # 2, 4, 8, 16, 32 seconds
                    log(f"⚠️  Erreur: {e}, retry {retries}/{max_retries} dans {delay}s...")
                    time.sleep(delay)
            return False
        return wrapper
    return decorator

# =============================================================================
# QUEUE LOCALE
# =============================================================================
def save_to_local_queue(attendance_data):
    """Sauvegarder le pointage localement si l'envoi échoue"""
    queue = []
    if Path(QUEUE_FILE).exists():
        try:
            with open(QUEUE_FILE, 'r') as f:
                queue = json.load(f)
        except:
            queue = []
    
    queue.append(attendance_data)
    
    try:
        with open(QUEUE_FILE, 'w') as f:
            json.dump(queue, f, indent=2)
        log(f"💾 Pointage sauvegardé localement (queue: {len(queue)} pointages)")
        return True
    except Exception as e:
        log(f"❌ Erreur sauvegarde locale: {e}")
        return False

def process_local_queue():
    """Envoyer les pointages en attente"""
    if not Path(QUEUE_FILE).exists():
        return
    
    try:
        with open(QUEUE_FILE, 'r') as f:
            queue = json.load(f)
    except:
        return
    
    if not queue:
        return
    
    log(f"📤 Traitement de {len(queue)} pointages en attente...")
    
    remaining = []
    sent_count = 0
    
    for item in queue:
        try:
            headers = {
                "Content-Type": "application/json",
                "X-Device-ID": DEVICE_ID,
                "X-Tenant-ID": TENANT_ID,
            }
            
            response = requests.post(BACKEND_URL, json=item, headers=headers, timeout=TIMEOUT)
            
            if response.status_code == 201:
                log(f"✅ Pointage historique envoyé: {item['employeeId']} à {item['timestamp']}")
                sent_count += 1
            else:
                remaining.append(item)
        except:
            remaining.append(item)
    
    # Sauvegarder ce qui reste
    try:
        with open(QUEUE_FILE, 'w') as f:
            json.dump(remaining, f, indent=2)
        log(f"📊 Queue: {sent_count} envoyés, {len(remaining)} restants")
    except Exception as e:
        log(f"❌ Erreur mise à jour queue: {e}")

# =============================================================================
# ENVOI AU BACKEND
# =============================================================================
@retry_with_backoff(max_retries=MAX_RETRIES, base_delay=BASE_RETRY_DELAY)
def send_attendance_to_backend_with_retry(payload, headers):
    """Envoie avec retry automatique"""
    response = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=TIMEOUT)
    
    if response.status_code == 201:
        return True
    else:
        log(f"❌ Erreur {response.status_code}: {response.text}")
        return False

def send_attendance_to_backend(attendance):
    """Envoie un pointage vers le backend PointaFlex"""
    employee_id = str(attendance.user_id)
    
    # Ignorer les employés de test si configuré
    if employee_id in IGNORED_EMPLOYEES:
        log(f"⊘ Employé {employee_id} ignoré (dans IGNORED_EMPLOYEES)")
        return True
    
    payload = {
        "employeeId": employee_id,
        "timestamp": attendance.timestamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "type": "IN",
        "method": VERIFY_MODE_MAP.get(attendance.punch, "MANUAL"),
        "rawData": {
            "confidence": 95,
            "deviceId": DEVICE_ID,
            "verifyMode": attendance.punch,
            "status": attendance.status
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-Device-ID": DEVICE_ID,
        "X-Tenant-ID": TENANT_ID,
    }
    
    # Utiliser le circuit breaker
    success = circuit_breaker.call(send_attendance_to_backend_with_retry, payload, headers)
    
    if success:
        log(f"✅ Pointage envoyé: {employee_id} à {attendance.timestamp}")
        return True
    else:
        # Si échec, sauvegarder localement
        log(f"⚠️  Échec envoi, sauvegarde locale...")
        save_to_local_queue(payload)
        return False

# =============================================================================
# BOUCLE PRINCIPALE
# =============================================================================
def main():
    """Boucle principale de synchronisation"""
    log("=" * 70)
    log(f"🔄 Démarrage - Connexion à {TERMINAL_IP}:{TERMINAL_PORT}")
    log(f"📋 Device ID: {DEVICE_ID}")
    log(f"⚙️  Timeout: {TIMEOUT}s, Retry: {MAX_RETRIES}, Backoff: {BASE_RETRY_DELAY}s")
    log("=" * 70)
    
    zk = ZK(TERMINAL_IP, port=TERMINAL_PORT, timeout=TIMEOUT)  # Timeout augmenté
    conn = None
    
    try:
        conn = zk.connect()
        log(f"✅ Connecté: {conn.get_device_name()}")
        log(f"📊 Firmware: {conn.get_firmware_version()}")
        log(f"👥 Utilisateurs: {len(conn.get_users())}")
        
        # Traiter la queue locale au démarrage
        process_local_queue()
        
        all_attendances = conn.get_attendance()
        
        if all_attendances:
            log(f"📊 Total: {len(all_attendances)} pointages dans le terminal")
            cutoff_date = datetime.now() - timedelta(days=1)
            recent_attendances = [a for a in all_attendances if a.timestamp >= cutoff_date]
            
            if recent_attendances:
                log(f"📊 Récents (24h): {len(recent_attendances)} pointages")
            
            last_timestamp = max([a.timestamp for a in all_attendances])
        else:
            last_timestamp = datetime.now()
            log("📊 Aucun pointage dans le terminal")
        
        log(f"🚀 Synchronisation active (intervalle: {CHECK_INTERVAL}s)")
        
        while True:
            try:
                attendances = conn.get_attendance()
                new_attendances = [a for a in attendances if a.timestamp > last_timestamp]
                
                if new_attendances:
                    log(f"📥 {len(new_attendances)} nouveau(x) pointage(s)")
                    
                    for attendance in new_attendances:
                        success = send_attendance_to_backend(attendance)
                        if success:
                            last_timestamp = attendance.timestamp
                
                # Essayer de traiter la queue locale régulièrement
                if circuit_breaker.state == "CLOSED":
                    process_local_queue()
                
                time.sleep(CHECK_INTERVAL)
                
            except Exception as e:
                log(f"⚠️  Erreur boucle: {e}")
                time.sleep(CHECK_INTERVAL)
    
    except Exception as e:
        log(f"❌ Erreur de connexion: {e}")
        log("Tentative de reconnexion dans 30 secondes...")
        time.sleep(30)
        # Redémarrer
        main()
    
    finally:
        if conn:
            conn.disconnect()
            log("👋 Déconnecté")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log("🛑 Arrêt demandé")
    except Exception as e:
        log(f"💥 Erreur critique: {e}")
