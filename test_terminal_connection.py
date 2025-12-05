#!/usr/bin/env python3
"""
Script de diagnostic pour tester la connexion au terminal ZKTeco
"""

import socket
import sys
from zk import ZK

# IPs des terminaux découverts
TERMINALS = [
    {"name": "Principale", "ip": "192.168.16.174", "port": 4370},
    {"name": "Pointeuse Cl", "ip": "192.168.16.175", "port": 4370},
]

def test_tcp_connection(ip, port):
    """Teste la connexion TCP basique"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex((ip, port))
        sock.close()
        return result == 0
    except Exception as e:
        return False

def test_zk_connection(ip, port):
    """Teste la connexion via le SDK ZKTeco"""
    try:
        zk = ZK(ip, port=port, timeout=5)
        conn = zk.connect()

        # Récupérer les informations
        device_name = conn.get_device_name()
        firmware = conn.get_firmware_version()
        users_count = len(conn.get_users())

        conn.disconnect()

        return {
            "success": True,
            "device_name": device_name,
            "firmware": firmware,
            "users": users_count
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    print("=" * 70)
    print("🔍 DIAGNOSTIC DE CONNEXION TERMINAUX ZKTECO")
    print("=" * 70)
    print()

    for terminal in TERMINALS:
        name = terminal["name"]
        ip = terminal["ip"]
        port = terminal["port"]

        print(f"📱 Terminal: {name}")
        print(f"   IP: {ip}:{port}")
        print()

        # Test 1: Connexion TCP
        print("   Test 1/2: Connexion TCP...", end=" ")
        tcp_ok = test_tcp_connection(ip, port)
        if tcp_ok:
            print("✅ OK")
        else:
            print("❌ ÉCHEC (port non accessible)")
            print()
            continue

        # Test 2: Connexion SDK ZKTeco
        print("   Test 2/2: Connexion SDK ZKTeco...", end=" ")
        zk_result = test_zk_connection(ip, port)

        if zk_result["success"]:
            print("✅ OK")
            print()
            print(f"   📊 Nom du terminal: {zk_result['device_name']}")
            print(f"   📊 Firmware: {zk_result['firmware']}")
            print(f"   👥 Utilisateurs: {zk_result['users']}")
            print()
            print(f"   ✅ Ce terminal peut être utilisé!")
            print(f"   💡 Modifier TERMINAL_IP = \"{ip}\" dans zkteco_bridge.py")
        else:
            print(f"❌ ÉCHEC")
            print(f"   Erreur: {zk_result['error']}")

        print()
        print("-" * 70)
        print()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Test interrompu")
        sys.exit(0)
