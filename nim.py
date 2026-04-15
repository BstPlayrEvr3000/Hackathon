import sys
print("enter a set of numbers, seperated by spaces")
numbers=sys.stdin.readline()[:-1].split()
piles=[]
for i in enumerate(numbers):
    piles.append(int(i[1]))
print(piles)
ChipsLeft = True
def check(player):
    nowinner = False
    for i in range(len(piles)):
        if piles[i] != 0:
            nowinner = True
    if nowinner == False:
        print(player + " is the winner")
    ChipsLeft = False
while(ChipsLeft):
    pile = int(input("What pile does player 1 take chips from? ")) - 1
    chips = int(input("How many chips does player 1 take? "))
    piles[pile] = piles[pile] - chips
    print(piles)
    check("player 1")
    if ChipsLeft == False:
        break
    pile = int(input("What pile does player 2 take chips from?" )) - 1
    chips = int(input("How many chips does player 2 take?" ))
    piles[pile] = piles[pile] - chips
    print(piles)
    check("player 2")
