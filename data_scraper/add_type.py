import json 
filename = "file.json"

with open(filename, 'r') as file:
    # Load the JSON data into a Python dictionary
    data = json.load(file)

categories = ["Robbery","Arson","Simple Assault","Aggravated Assault","Murder","Burglary","Shooting"]
ans = []
for i in range(len(data)):
    my_dict = data[i]
    for category in categories:
        check = my_dict.get("type")
        if category in check or category.upper() in check:
            my_dict["category"]=category
            ans.append(my_dict)
            break 
with open("new.json",'w') as file:
    json.dump(ans,file,indent=4)
