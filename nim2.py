import sys
import turtle

# Note to debuggers: ^ means XOR function e.g. 3^5=11_2^101_2=110_2=6

try:
    print('enter a set of numbers, seperated by spaces')
    print('choose a heap, take a positive amount from it. last player to move wins')
    numbers=sys.stdin.readline()[:-1].split()
except ValueError:
    print("invalid format, try again")

piles=[] #keeping track of all heaps
for i in enumerate(numbers):
    piles.append(int(i[1]))
##### add-on
# uses turtle to make pictures of chips stack
def makechips(t, n):
    for i in range(n):
        t.pendown()
        t.begin_fill()
        t.circle(40)
        t.end_fill()
        t.penup()
        t.left(90)
        t.forward(15)
        t.right(90)
    for i in range(4):
        t.undo()   
turtles = []
for i in range(len(piles)):
    turtles.append(turtle.Turtle())
    turtles[i].speed(0)
    turtles[i].penup()
    turtles[i].goto(50,20)
    turtles[i].fillcolor("green")
    turtles[i].goto(-150+100*i,-200)
    makechips(turtles[i], piles[i])
def takeChips(n, p):
    for i in range(8 * int(n)):
        turtles[int(p)].undo()
####
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
    # How nim works is that you want to give other player piles where XOR is 0, then it is a monovariant that eventualy spirals to 0,0,... and they lose. The bot here is lucky and is always given a positive xor, since a zero xor must always change into a positive xor no mattter what the player does
    nim_sum=0
    for i in piles:
        nim_sum=nim_sum^i
    bin_sum=str(bin(nim_sum))[2:]
    for heap in range(len(piles)):
        heap_bin=str(bin(piles[heap]))[2:]
        if len(bin_sum)<=len(heap_bin) and int(heap_bin[-len(bin_sum)])==1:
            return heap, piles[heap]-(nim_sum^piles[heap])
if player_turn=='A':
    print('the piles are')
    print(piles)
    print('enter the pile followed by a space then the amount you take')
    pile,amount=sys.stdin.readline()[:-1].split(' ')
    pile=int(pile)-1 # turning it from integer after split to string
    amount=int(amount)
    while pile<0 or pile>=len(piles) or amount>piles[pile] or amount<1:
        print("invalid, try again")
        pile,amount=sys.stdin.readline()[:-1].split(' ')
        pile=int(pile)-1
        amount=int(amount)
    takeChips(amount, pile) # takes the amount of chips taken to edit stacks
    piles[pile]-=amount
while True:
    print('Amount left for bot:')
    print(piles)
    bot_pile, bot_amount=play_game(piles)
    print('the bot has taken: '+str(bot_amount)+' from pile '+str(bot_pile+1))
    piles[bot_pile]-=bot_amount
    print('the piles are')
    print(piles)
    takeChips(bot_amount, bot_pile) # takes the amount of chips taken to edit stacks
    if sum(piles)==0:
        break
    print('enter the pile followed by a space then the amount you take')
    pile,amount=sys.stdin.readline()[:-1].split(' ')
    pile=int(pile)-1 # turning it from integer after split to string
    amount=int(amount)
    while pile<0 or pile>=len(piles) or amount>piles[pile] or amount<1:
        print("invalid, try again")
        pile,amount=sys.stdin.readline()[:-1].split(' ')
        pile=int(pile)-1
        amount=int(amount)
    piles[pile]-=amount
    takeChips(amount, pile) # takes the amount of chips taken to edit stacks
print('You lose!...its rigged anyway')
