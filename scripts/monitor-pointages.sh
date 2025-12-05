#!/bin/bash
# Script de surveillance des pointages en temps réel

echo "🔍 SURVEILLANCE DES POINTAGES - PointaFlex"
echo "=========================================="
echo ""
echo "Appuyez sur Ctrl+C pour arrêter"
echo ""

# Compteur initial
LAST_COUNT=0

while true; do
  # Récupérer le nombre total de pointages aujourd'hui
  COUNT=$(PGPASSWORD='MAMPAPOLino0102' psql \
    -h aws-1-eu-north-1.pooler.supabase.com \
    -p 6543 \
    -U postgres.apeyodpxnxxwdxwcnqmo \
    -d postgres \
    -t -c "SELECT COUNT(*) FROM \"Attendance\" WHERE DATE(\"createdAt\") = CURRENT_DATE;" 2>/dev/null | xargs)

  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

  # Vérifier si un nouveau pointage est arrivé
  if [ "$COUNT" != "$LAST_COUNT" ]; then
    if [ "$LAST_COUNT" != "0" ]; then
      DIFF=$((COUNT - LAST_COUNT))
      echo "[$TIMESTAMP] ✅ NOUVEAU POINTAGE ! Total aujourd'hui : $COUNT (+$DIFF)"

      # Afficher le dernier pointage
      echo "Dernier pointage :"
      PGPASSWORD='MAMPAPOLino0102' psql \
        -h aws-1-eu-north-1.pooler.supabase.com \
        -p 6543 \
        -U postgres.apeyodpxnxxwdxwcnqmo \
        -d postgres \
        -c "SELECT a.timestamp, e.matricule, e.\"firstName\", a.type, a.method FROM \"Attendance\" a LEFT JOIN \"Employee\" e ON a.\"employeeId\" = e.id ORDER BY a.\"createdAt\" DESC LIMIT 1;" 2>/dev/null
      echo ""
    else
      echo "[$TIMESTAMP] Total pointages aujourd'hui : $COUNT"
    fi
    LAST_COUNT=$COUNT
  else
    echo -ne "[$TIMESTAMP] En attente... (Total : $COUNT)\r"
  fi

  sleep 3
done
