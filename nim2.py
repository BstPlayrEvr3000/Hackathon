import sys

# Note to debuggers: ^ means XOR function e.g. 3^5=11_2^101_2=110_2=6
try:
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
if nimsum==0:#the xor is 0, the first player loses
    player_turn='A'
    print('You will be first')
else: #the xor is not zero, the first player wins
    player_turn='B'
    print('You will be second')

def play_game(piles): # Shockingly, it means the Bot's repsonse in which pile and the amount it takes! 🤯
    # How nim works is that you want to give other other player piles where XOR is 0, then it is a monovariant that eventualy spirals to 0,0,... and they lose. The bot here is lucky and is always given a positive xor, since a zero xor must always change into a positive xor no mattter what the player does
    nim_sum=0
    for i in piles:
        nim_sum=nim_sum^i
    bin_sum=str(bin(nim_sum))[2:]
    for heap in range(len(piles)):
        heap_bin=str(bin(piles[heap]))[2:]
        if heap_bin[-len(bin_sum)]==1:
            return heap, nim_sum^piles[heap]
if player_turn=='A':
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
while sum(piles)!=0:
    bot_pile, bot_amount=play_game(piles)
    print('the bot has taken: '+str(bot_amount)+' from pile '+str(bot_pile))
    piles[bot_pile]-=bot_amount
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
print('You lose!...its rigged anyway')
