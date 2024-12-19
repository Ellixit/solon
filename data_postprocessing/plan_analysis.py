# find a few interesting plans, such as:
# plans with districts that are heavily rural, urban, or suburban
# find min and max for each value
# WIP
import json
import numpy as np
STATES = ["ok", "ct"]
PLAN_SIZE = 5000
summary = {}
for state in STATES:
    summary[state] = {}
    current_dist_data = json.load(open(state+"-district-data.json", "rb"))
    DESIRED_POPS = ["TRUMP_norm","BIDEN_norm",'White_norm', 'Black_norm', 'Native_norm', 'Asian_norm', 'Other Race_norm', "population", "area",
                     '< $10k_norm', '$10k - $29k_norm', '$30k - $49k_norm', '$50k - $99k_norm', '$100k - $149k_norm', '$150k - $199k_norm', '> $200k_norm',
                      "population_rural_norm", "population_urban_norm", "population_suburban_norm", "poverty_level_norm"]
    FINANCE_WEIGHTS = {
        '< $10k_norm': 5000,
        '$10k - $29k_norm': 20000,
        '$30k - $49k_norm': 40000,
        '$50k - $99k_norm': 75000,
        '$100k - $149k_norm': 125000,
        '$150k - $199k_norm': 175000,
        '> $200k_norm': 225000
    }
    LAND_TYPE_WEIGHTS = {
        "population_rural_norm": 0,
        "population_urban_norm": 1,
        "population_suburban_norm": 2
    }
    for DESIRED_POP in DESIRED_POPS:
        summary[state][DESIRED_POP] = []
        current_dist_cnt = len(current_dist_data)
        min_val = None
        max_val = None
        min_dist = None
        max_dist = None
        min_plan = None
        max_plan = None
        for i in range(PLAN_SIZE): # 5000 or 250, ensemble plan count
            plan_file = open("../seawulf/output/fix_official_fullensemble/"+str(i)+"_"+state+str(PLAN_SIZE)+".json", "rb")
            plan_file_districts = json.load(plan_file)["district"]
            for distname, dist in plan_file_districts.items():
                if min_val == None or dist[DESIRED_POP] < min_val:
                    min_val = dist[DESIRED_POP]
                    min_dist = distname
                    min_plan = i
                if max_val == None or dist[DESIRED_POP] > max_val:
                    max_val = dist[DESIRED_POP]
                    max_dist = distname
                    max_plan = i
            plan_file.close()
        prop_stats = {
            "min": {"min_val": min_val, "min_dist": min_dist, "min_plan": min_plan},
            "max": {"max_val": max_val, "max_dist": max_dist, "max_plan": max_plan},
        }
        summary[state][DESIRED_POP] = prop_stats
    min_finance = None
    min_finance_plan = None
    max_finance = None
    max_finance_plan = None
    min_land = None
    min_land_plan = None
    max_land = None
    max_land_plan = None
    for i in range(PLAN_SIZE): # 5000 or 250, ensemble plan count
        plan_file = open("../seawulf/output/fix_official_fullensemble/"+str(i)+"_"+state+str(PLAN_SIZE)+".json", "rb")
        plan_file_districts = json.load(plan_file)["district"]
        finance_total = 0
        land_total = 0
        for distname, dist in plan_file_districts.items():
            for financeprop, financeweight in FINANCE_WEIGHTS.items():
                finance_total += dist[financeprop] * financeweight
            for landprop, landweight in LAND_TYPE_WEIGHTS.items():
                land_total += dist[landprop] * landweight
        finance_final = finance_total / len(plan_file_districts)
        land_final = land_total / len(plan_file_districts)
        if min_finance == None or finance_final < min_finance:
            min_finance = finance_final
            min_finance_plan = i
        if max_finance == None or finance_final > max_finance:
            max_finance = finance_final
            max_finance_plan = i
        if min_land == None or land_final < min_land:
            min_land = land_final
            min_land_plan = i
        if max_land == None or land_final > max_land:
            max_land = land_final
            max_land_plan = i
        plan_file.close()
    summary[state]["finance"] = {"min_finance": min_finance, "min_finance_plan": min_finance_plan, "max_finance": max_finance, "max_finance_plan": max_finance_plan}
    summary[state]["land"] = {"min_land": min_land, "min_land_plan": min_land_plan, "max_land": max_land, "max_land_plan": max_land_plan}
    open("interesting_plans_"+state+".json", "w").write(json.dumps(summary[state]))