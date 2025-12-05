#!/usr/bin/env python3
"""
ADMS Protocol Listener pour terminaux ZKTeco IN01
Écoute le protocole ADMS et convertit vers HTTP pour PointaFlex
"""

import socket
import struct
import json
import requests
from datetime import datetime
import threading

# Configuration
ADMS_LISTEN_PORT = 8081
BACKEND_URL = "http://localhost:3000/api/v1/attendance/push"
DEVICE_ID = "Terminal_Caisse"
TENANT_ID = "90fab0cc-8539-4566-8da7-8742e9b6937b"

class ADMSListener:
    def __init__(self, port=8081):
        self.port = port
        self.sock = None

    def start(self):
        """Démarre le serveur ADMS"""
        print(f"🎧 Démarrage du listener ADMS sur le port {self.port}")
        print(f"📡 Backend: {BACKEND_URL}")
        print(f"⏳ En attente de connexions des terminaux...")
        print("")

        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind(('0.0.0.0', self.port))
        self.sock.listen(5)

        while True:
            try:
                client, addr = self.sock.accept()
                print(f"🔌 Nouvelle connexion depuis: {addr}")

                # Handle dans un thread séparé
                thread = threading.Thread(
                    target=self.handle_client,
                    args=(client, addr)
                )
                thread.daemon = True
                thread.start()

            except KeyboardInterrupt:
                print("\n🛑 Arrêt du serveur...")
                break
            except Exception as e:
                print(f"❌ Erreur: {e}")

    def handle_client(self, client, addr):
        """Gère une connexion client ADMS"""
        try:
            while True:
                # Recevoir les données
                data = client.recv(4096)
                if not data:
                    break

                print(f"📥 Données reçues ({len(data)} bytes) depuis {addr}")
                print(f"   Hex: {data.hex()}")

                # Parser les données ADMS
                attendance_data = self.parse_adms_data(data)

                if attendance_data:
                    # Envoyer vers le backend
                    success = self.send_to_backend(attendance_data)

                    if success:
                        print(f"✅ Pointage envoyé: {attendance_data['employeeId']} à {attendance_data['timestamp']}")
                        # Réponse ACK au terminal
                        ack = b'\x50\x50\x82\x7D\x00\x00\x00\x00\x00\x00\x00\x00'
                        client.send(ack)
                    else:
                        print(f"❌ Erreur lors de l'envoi au backend")
                else:
                    print(f"⚠️  Données non reconnues comme pointage")

        except Exception as e:
            print(f"❌ Erreur client {addr}: {e}")
        finally:
            client.close()
            print(f"🔌 Connexion fermée: {addr}")

    def parse_adms_data(self, data):
        """
        Parse les données du protocole ADMS
        Format peut varier selon le terminal
        """
        try:
            # ADMS a généralement cette structure pour les pointages:
            # Header (8 bytes) + Data payload

            if len(data) < 8:
                return None

            # Header ADMS typique commence par 0x50 0x50
            if data[0:2] != b'\x50\x50':
                return None

            # Le command code est au byte 2-3
            command = struct.unpack('<H', data[2:4])[0]

            # Command 0x0011 = Real-time attendance
            if command == 0x0011:
                return self.parse_realtime_attendance(data)

            # Command 0x0012 = Stored attendance
            elif command == 0x0012:
                return self.parse_stored_attendance(data)

            return None

        except Exception as e:
            print(f"⚠️  Erreur parsing ADMS: {e}")
            return None

    def parse_realtime_attendance(self, data):
        """Parse un pointage temps réel ADMS"""
        try:
            # Structure typique (peut varier):
            # Bytes 8-11: User ID
            # Bytes 12-15: Timestamp (Unix)
            # Byte 16: Status (0=check-out, 1=check-in)
            # Byte 17: Verify mode (0=password, 1=fingerprint, etc.)

            if len(data) < 18:
                return None

            user_id = struct.unpack('<I', data[8:12])[0]
            timestamp_unix = struct.unpack('<I', data[12:16])[0]
            status = data[16]
            verify_mode = data[17]

            # Convertir timestamp
            dt = datetime.fromtimestamp(timestamp_unix)

            # Mapper status
            att_type = "OUT" if status == 0 else "IN"

            # Mapper verify mode
            method_map = {
                0: "PIN_CODE",
                1: "FINGERPRINT",
                3: "FINGERPRINT",
                4: "FACE_RECOGNITION",
                15: "RFID_BADGE"
            }
            method = method_map.get(verify_mode, "MANUAL")

            return {
                "employeeId": str(user_id),
                "timestamp": dt.isoformat(),
                "type": att_type,
                "method": method,
                "rawData": {
                    "protocol": "ADMS",
                    "status": status,
                    "verifyMode": verify_mode
                }
            }

        except Exception as e:
            print(f"⚠️  Erreur parse realtime: {e}")
            return None

    def parse_stored_attendance(self, data):
        """Parse un pointage stocké ADMS"""
        # Similar to realtime but may have different offsets
        return self.parse_realtime_attendance(data)

    def send_to_backend(self, attendance_data):
        """Envoie le pointage vers PointaFlex backend"""
        try:
            headers = {
                "Content-Type": "application/json",
                "Device-ID": DEVICE_ID,
                "X-Tenant-ID": TENANT_ID
            }

            response = requests.post(
                BACKEND_URL,
                json=attendance_data,
                headers=headers,
                timeout=5
            )

            if response.status_code in [200, 201]:
                return True
            else:
                print(f"❌ Backend error {response.status_code}: {response.text}")
                return False

        except Exception as e:
            print(f"❌ Erreur envoi backend: {e}")
            return False

def main():
    print("=" * 60)
    print("🎧 ADMS Protocol Listener pour ZKTeco IN01")
    print("=" * 60)
    print("")
    print("Configuration:")
    print(f"  • Port d'écoute: {ADMS_LISTEN_PORT}")
    print(f"  • Backend: {BACKEND_URL}")
    print(f"  • Device ID: {DEVICE_ID}")
    print(f"  • Tenant ID: {TENANT_ID}")
    print("")

    listener = ADMSListener(ADMS_LISTEN_PORT)

    try:
        listener.start()
    except KeyboardInterrupt:
        print("\n\n🛑 Arrêt du listener ADMS")

if __name__ == "__main__":
    main()
