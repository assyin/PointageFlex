#!/usr/bin/env python3
"""
ZKTeco Terminal Bridge - Envoie les pointages du terminal ZKTeco vers PointaFlex
Nécessite: pip install pyzk requests
"""

import time
import requests
from datetime import datetime
from zk import ZK

# Configuration
TERMINAL_IP = "192.168.16.174"  # IP de votre terminal ZKTeco
TERMINAL_PORT = 4370  # Port par défaut ZKTeco
BACKEND_URL = "http://localhost:3000/api/v1/attendance/webhook"
DEVICE_ID = "TERMINAL-PRINC-001"
TENANT_ID = "90fab0cc-8539-4566-8da7-8742e9b6937b"
CHECK_INTERVAL = 10  # Vérifier toutes les 10 secondes

# Mapping des types de vérification ZKTeco
VERIFY_MODE_MAP = {
    0: "PIN_CODE",       # Mot de passe
    1: "FINGERPRINT",    # Empreinte digitale
    3: "FINGERPRINT",    # Mot de passe + Empreinte
    4: "FACE_RECOGNITION", # Reconnaissance faciale
    15: "RFID_BADGE",    # Badge RFID
}

def send_attendance_to_backend(attendance):
    """Envoie un pointage vers le backend PointaFlex"""

    # Convertir l'attendance ZKTeco au format PointaFlex
    payload = {
        "employeeId": str(attendance.user_id),  # Utiliser le User ID comme matricule
        "timestamp": attendance.timestamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "type": "IN",  # Par défaut entrée (vous pouvez ajouter une logique)
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

    try:
        response = requests.post(BACKEND_URL, json=payload, headers=headers, timeout=5)
        if response.status_code == 201:
            print(f"✅ Pointage envoyé: {attendance.user_id} à {attendance.timestamp}")
            return True
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur d'envoi: {e}")
        return False

def main():
    """Boucle principale de synchronisation"""

    print(f"🔄 Connexion au terminal ZKTeco à {TERMINAL_IP}:{TERMINAL_PORT}...")

    zk = ZK(TERMINAL_IP, port=TERMINAL_PORT, timeout=5)
    conn = None

    try:
        conn = zk.connect()
        print(f"✅ Connecté au terminal: {conn.get_device_name()}")
        print(f"📊 Version firmware: {conn.get_firmware_version()}")
        print(f"👥 Utilisateurs enregistrés: {len(conn.get_users())}")

        # Récupérer tous les pointages pour obtenir le dernier ID
        all_attendances = conn.get_attendance()

        if all_attendances:
            print(f"\n📊 Total de {len(all_attendances)} pointages dans le terminal")

            # Ne synchroniser que les pointages récents (dernières 24h par défaut)
            from datetime import datetime, timedelta
            cutoff_date = datetime.now() - timedelta(days=1)

            recent_attendances = [a for a in all_attendances if a.timestamp >= cutoff_date]

            if recent_attendances:
                print(f"📊 {len(recent_attendances)} pointages des dernières 24h seront synchronisés")

                # Demander confirmation si beaucoup de pointages
                if len(recent_attendances) > 100:
                    print(f"\n⚠️  ATTENTION: {len(recent_attendances)} pointages à synchroniser")
                    print("Voulez-vous continuer? (O/N)")
                    # Note: En production, on skip cette confirmation
                    # response = input().upper()
                    # if response != 'O':
                    #     print("Synchronisation annulée")
                    #     return

            # Marquer comme déjà traités (commencer à partir de maintenant)
            last_timestamp = max([a.timestamp for a in all_attendances])
        else:
            last_timestamp = datetime.now()
            print("\n📊 Aucun pointage dans le terminal")

        print(f"\n🚀 Début de la synchronisation en temps réel (intervalle: {CHECK_INTERVAL}s)")
        print("Appuyez sur Ctrl+C pour arrêter\n")

        while True:
            try:
                # Récupérer tous les pointages
                attendances = conn.get_attendance()

                # Filtrer uniquement les nouveaux pointages (après le dernier timestamp)
                new_attendances = [a for a in attendances if a.timestamp > last_timestamp]

                if new_attendances:
                    print(f"\n📥 {len(new_attendances)} nouveau(x) pointage(s) détecté(s)")

                    for attendance in new_attendances:
                        success = send_attendance_to_backend(attendance)
                        if success:
                            last_timestamp = attendance.timestamp

                # Attendre avant la prochaine vérification
                time.sleep(CHECK_INTERVAL)

            except Exception as e:
                print(f"⚠️ Erreur lors de la récupération: {e}")
                time.sleep(CHECK_INTERVAL)

    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        print("\nVérifiez:")
        print("  1. L'IP du terminal est correcte")
        print("  2. Le terminal est allumé et connecté au réseau")
        print("  3. Le port 4370 n'est pas bloqué par un firewall")

    finally:
        if conn:
            conn.disconnect()
            print("\n👋 Déconnecté du terminal")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Arrêt de la synchronisation")
