
import pandas as pd
import numpy as np
import json
import collections as co
import random
from itertools import combinations,product


class Rec:
	def recommend(cal,prot,fat,carb,veg,optimised_on):
		df1 = pd.read_csv("/home/sharat/club/static/data/output - output.csv")
		df2 = pd.read_csv("/home/sharat/club/static/data/output2 - output2.csv")

		df1 = df1.fillna(value="v")
		df2 = df2.dropna(subset=["type"],axis=0)
		df2 = df2.fillna(value="v")

		df1.drop("Unnamed: 0",axis=1,inplace=True)
		df2.drop("Unnamed: 0",axis=1,inplace=True)
		df2 = df2.rename(columns={"items": "meal"})
		cols = ["meal","Calories","Carbohydrates","Fat","Protein","Quantity","type","veg/non-veg"]

		for i in cols[1:-3]:
			df2[i] /= 2
		df2[cols[-3]] = [i.replace('100','50') for i in df2[cols[-3]]]

		#inputs..
		cal = cal
		prot = prot
		fat = fat
		carb = carb
		veg = veg # input 0 for veg 1 for eggitarian and 2  for non-veg
		optimised_on = optimised_on # inputs Fat,Protein,Carbohydrates

		optim = {"Fat":fat,"Carbohydrates":carb,"Protein":prot}
		df = pd.concat([df1[cols],df2[cols]])
		if veg == 0:
			df = df[df["veg/non-veg"]=='v']
		elif veg == 1:
			df = df[(df["veg/non-veg"]=='v')|(df["veg/non-veg"]=='eg')]
		df.reset_index(drop=True, inplace=True)
		li = []
		for i,j in zip(df["type"],df["meal"]):
			if "paratha" in j.lower():
				li.append("nb")
			else:
				li.append(i)
		df["type"] = li
		freq = {'j':2,'f':2,'nb':1,'b':2,'n':3,'s':2,'si':2,'d':2,'m':1}
		li = df.groupby("type")
		indices = {}
		for i,j in li:
			indices[i] = list(j.index)
		for i in indices:
			indices[i] = list(combinations(indices[i], freq[i]))
		for i in indices:
			li = []
			for j in indices[i]:
				li.append(int(sum([df.iloc[k][optimised_on] for k in list(j)])))
			indices[i] = dict(zip(indices[i],li))
		for i in indices:
			indices[i] = {k: v for k, v in sorted(indices[i].items(), key=lambda item: item[1])}
		# for i in indices:
		#     print(max(indices[i].values()),min(indices[i].values()))


		keys = {}
		for i in indices:
			maxe = max(indices[i].values())
			mine = min(indices[i].values())
			diff = (maxe-mine)/6.0
			li = []
			pi = []
			mi = []
			mine += diff/2
			for j,k in zip(indices[i].values(),indices[i].keys()):
				if j <= mine:
					li.append(k)
				else:
					if len(li)>0:
						pi.append(int(mine-diff/2))
						mi.append(li)
						li = []
					mine += diff
			keys[i] = dict(zip(pi,mi))
		vals = []
		for i in keys:
			vals.append(list(keys[i].keys()))

		lop = list(product(*vals))
		cost = []
		for i in lop:
			cost.append(abs(sum(i)-optim[optimised_on]))
		cost = dict(zip(cost,lop))
		res = {}
		for i in range(9):
			no = random.randrange(len(keys[list(keys.keys())[i]][cost[min(cost.keys())][i]]))
			if list(keys.keys())[i]=="s":
				res[list(keys.keys())[i]] = list(keys[list(keys.keys())[i]][cost[min(cost.keys())][i]][0])
				res[list(keys.keys())[i]].extend(list(keys[list(keys.keys())[i]][cost[min(cost.keys())][i]][-1]))
				print(res)
			else:
				res[list(keys.keys())[i]] = list(keys[list(keys.keys())[i]][cost[min(cost.keys())][i]][no])
		# lop = list(keys[list(keys.keys())[7]][cost[min(cost.keys())][7]])
		# lope = []
		# for i in lop:
		# 	if res["s"][0] not in i and res["s"][1] not in i:
		# 		lope.append(i)
		# no = random.randrange(len(lope))
		# res["s"].extend()
		result = {}
		for i in res:
			result[i] = [df.iloc[j]["meal"] for j in list(res[i])]

		plan = {}
		plan['breakfast'] = [result["j"][0]+" ("+df.iloc[res["j"][0]]["Quantity"]+")",
							 result["f"][0]+" ("+df.iloc[res["f"][0]]["Quantity"]+")",
							 result["b"][0]+" ("+df.iloc[res["b"][0]]["Quantity"]+")",
							 result["nb"][0]+" ("+df.iloc[res["nb"][0]]["Quantity"]+")"]
		plan['lunch'] = [result["n"][0]+" ("+df.iloc[res["n"][0]]["Quantity"]+")",
							 result["n"][1]+" ("+df.iloc[res["n"][1]]["Quantity"]+")",
							 result["s"][0]+" ("+df.iloc[res["s"][0]]["Quantity"]+")",
							 result["s"][1]+" ("+df.iloc[res["s"][1]]["Quantity"]+")",
							 result["si"][0]+" ("+df.iloc[res["si"][0]]["Quantity"]+")",
							 result["d"][0]+" ("+df.iloc[res["d"][0]]["Quantity"]+")"]
		plan["dinner"] = [result["n"][2]+" ("+df.iloc[res["n"][2]]["Quantity"]+")",
							 result["s"][2]+" ("+df.iloc[res["s"][2]]["Quantity"]+")",
							 result["s"][3]+" ("+df.iloc[res["s"][3]]["Quantity"]+")",
							 result["si"][1]+" ("+df.iloc[res["si"][1]]["Quantity"]+")",
							 result["d"][1]+" ("+df.iloc[res["d"][1]]["Quantity"]+")"]

		plan["pre-lunch"] = [result["m"][0]+" ("+df.iloc[res["m"][0]]["Quantity"]+")",
							 result["j"][1]+" ("+df.iloc[res["j"][1]]["Quantity"]+")"]

		plan["post-lunch"] = [result["b"][1]+" ("+df.iloc[res["b"][1]]["Quantity"]+")",
							 result["f"][1]+" ("+df.iloc[res["f"][1]]["Quantity"]+")"]

		return plan
# dots = []
# for i in res:
#     for j in res[i]:
#         dots.append(df.iloc[j]["Protein"])

# sum(dots)
#Rec.recommend(2800,75,100,500,0,'Carbohydrates')