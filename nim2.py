import sys
print('enter a set of numbers, seperated by spaces')
print('choose a heap, take a positive amount from it. last player to move wins')
except Exception():
    print("invalid format, try again")
numbers=sys.stdin.readline()[:-1].split(' ')
piles=[] #keeping track of all heaps
for i in enumerate(numbers):
    piles.append(int(i[1]))
nimsum=0
for i in piles:
    nimsum=nimsum^i
player_turn=0 # will be marked A or B
if nimsum=0:#the xor is 0, the first player loses
    player_turn='A'
    print('You will be first')
else: #the xor is not zero, the first player wins
    player_turn='B'
    print('You will be second')
ongoing=True#will end when the player loses
while ongoing:
    print('the piles are')
    print(piles)
    print('enter the pile followed by a space then the amount you take')
    pile,amount=sys.stdin.readline[:-1].split(' ')
    pile=int(pile) # turning it from integer after split to string
    amount=int(amount)
    while pile<1 or pile>len(piles) or amount>piles[pile] or amount<1:
        print("invalid, try again")
        pile,amount=sys.stdin.readline[:-1].split(' ')
        pile=int(pile)
    piles[pile]-=amount
