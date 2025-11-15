#!/bin/bash
echo "📱 MONITOR DE SISTEMA"
echo "=================="

# Batería
echo "🔋 BATERÍA:"
termux-battery-status 2>/dev/null | jq -r '"\(.percentage)% | \(.status) | \(.temperature)°C"' || echo "Instala: pkg install termux-api"

# Memoria
echo -e "\n💾 MEMORIA:"
free -m | grep Mem | awk '{print "Usada: "$3"MB | Libre: "$4"MB | Total: "$2"MB"}'

# Almacenamiento
echo -e "\n💿 ALMACENAMIENTO:"
df -h /data | tail -1 | awk '{print "Usado: "$3" | Libre: "$4" | Total: "$2"}'

# CPU (si disponible)
echo -e "\n⚡ CPU:"
cat /proc/cpuinfo | grep "processor" | wc -l | xargs echo "Núcleos:"
