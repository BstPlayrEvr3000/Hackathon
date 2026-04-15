import sys
print("enter a set of numbers, seperated by spaces")
numbers=sys.stdin.readline()[:-1].split()
piles=[]
for i in enumerate(numbers):
    piles.append(int(i[1]))
nimsum=0
for i in piles:
    nimsum=nimsum^i
player_turn=0
if nimsum==0:
    player_turn='A'
    print('You will be first')
    print('enter the first pile')
else:
    player_turn='B'
    print('You will be second')
