#!/bin/bash

API_URL="http://127.0.0.1:8000"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "============================================================"
echo "🎓 Student Population Script"
echo "============================================================"

# Delete all existing students
echo ""
echo "🗑️  Deleting all existing students..."
STUDENTS=$(curl -s "${API_URL}/students/")
STUDENT_IDS=$(echo "$STUDENTS" | python3 -c "import sys, json; [print(s['id']) for s in json.load(sys.stdin)]" 2>/dev/null)

DELETED=0
for id in $STUDENT_IDS; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${API_URL}/students/${id}")
    if [ "$RESPONSE" = "204" ]; then
        DELETED=$((DELETED + 1))
    fi
done
echo -e "${GREEN}✅ Deleted $DELETED students${NC}"

# Classes
CLASSES=("FYCO1" "FYCO2" "SYCO1" "SYCO2" "TYCO1" "TYCO2")

# Sample names
FIRST_NAMES=("Aarav" "Aditi" "Akshay" "Ananya" "Arjun" "Avani" "Dev" "Diya" "Ishaan" "Kavya" "Krishna" "Meera" "Neha" "Pranav" "Priya" "Rahul" "Riya" "Rohan" "Saanvi" "Samar" "Sanvi" "Shreya" "Siddharth" "Tanvi" "Vihaan" "Vivaan" "Yash" "Zara" "Alex" "Emma" "James" "Olivia" "Michael" "Sophia" "William" "Isabella")
LAST_NAMES=("Patel" "Sharma" "Kumar" "Singh" "Gupta" "Verma" "Mehta" "Joshi" "Desai" "Shah" "Reddy" "Rao" "Iyer" "Nair" "Menon" "Pillai" "Khan" "Ali" "Ahmed" "Hussain" "Malik" "Sheikh" "Ansari" "Smith" "Johnson" "Williams" "Brown" "Jones" "Garcia" "Miller")

echo ""
echo "📚 Creating students for each class..."

TOTAL_CREATED=0

for CLASS in "${CLASSES[@]}"; do
    # Random number between 15-20
    NUM_STUDENTS=$((RANDOM % 6 + 15))
    echo ""
    echo "📖 $CLASS: Creating $NUM_STUDENTS students..."
    
    CREATED=0
    for i in $(seq 1 $NUM_STUDENTS); do
        # Generate year based on class
        if [[ $CLASS == FY* ]]; then
            YEAR="2024"
        elif [[ $CLASS == SY* ]]; then
            YEAR="2023"
        else
            YEAR="2022"
        fi
        
        SECTION=${CLASS: -1}
        ROLL_NO="${YEAR}${SECTION}$(printf "%03d" $i)"
        
        # Random name
        FIRST_NAME=${FIRST_NAMES[$RANDOM % ${#FIRST_NAMES[@]}]}
        LAST_NAME=${LAST_NAMES[$RANDOM % ${#LAST_NAMES[@]}]}
        NAME="${FIRST_NAME} ${LAST_NAME}"
        EMAIL=$(echo "${FIRST_NAME}${LAST_NAME}${i}" | tr '[:upper:]' '[:lower:]')"@student.edu"
        
        # Create student
        JSON_DATA="{\"roll_no\":\"$ROLL_NO\",\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"class_name\":\"$CLASS\"}"
        
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/students/" \
            -H "Content-Type: application/json" \
            -d "$JSON_DATA")
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        BODY=$(echo "$RESPONSE" | head -n-1)
        
        if [ "$HTTP_CODE" = "201" ]; then
            CREATED=$((CREATED + 1))
            echo -e "  ${GREEN}✅ $NAME ($ROLL_NO)${NC}"
        else
            echo -e "  ${RED}❌ Failed to create $NAME: $HTTP_CODE${NC}"
        fi
    done
    
    TOTAL_CREATED=$((TOTAL_CREATED + CREATED))
    echo -e "  ${GREEN}📊 Created $CREATED/$NUM_STUDENTS students for $CLASS${NC}"
done

echo ""
echo "============================================================"
echo -e "${GREEN}✨ Done! Total students created: $TOTAL_CREATED${NC}"
echo "============================================================"

