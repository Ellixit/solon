import json
import numpy as np
STATES = ["ok", "ct"]
summary = {}
for state in STATES:
    summary[state] = {}
    current_dist_data = json.load(open("../client/public/data/"+state+"-district-data.json", "rb"))
    DESIRED_POPS = ["WHITE", "BLACK", "NATIVE", "ASIAN", "OTHER_race", "poverty_level", #, "PACIFIC ISLANDER"
                    "Less than $10,000", "$10,000 to $14,999", "$15,000 to $19,999", "$20,000 to $24,999", "$25,000 to $29,999", "$30,000 to $34,999",
                    "$35,000 to $39,999", "$40,000 to $44,999", "$45,000 to $49,999", "$50,000 to $59,999", "$60,000 to $74,999", "$75,000 to $99,999",
                    "$100,000 to $124,999", "$125,000 to $149,999", "$150,000 to $199,999", "$200,000 or more",
                    "population_rural", "population_urban", "population_suburban"] # these population values and poverty levels need to be normalized to percentages
    for DESIRED_POP in DESIRED_POPS:
        summary[state][DESIRED_POP] = []
        current_dist_cnt = len(current_dist_data)
        plan_prop_ranges = [] # stores lists of smallest district values in each plan, second smallest, etc.
        for i in range(current_dist_cnt):
            plan_prop_ranges.append([])
        for i in range(5): # 5000 or 250, ensemble plan count
            plan_file = open("../seawulf/output/"+str(i)+"_short.json", "rb")
            plan_file_districts = json.load(plan_file)["district"]
            prop_values = []
            for dist in plan_file_districts.values():
                prop_values.append(dist[DESIRED_POP]) # append the values
            prop_values.sort()
            plan_file.close()
            for i in range(current_dist_cnt):
                plan_prop_ranges[i].append(prop_values[i])
        for i in range(current_dist_cnt): # statistics for the smallest district values in each plan, second smallest, etc.
            prop_stats = {
                "min": min(plan_prop_ranges[i]),
                "q1": np.percentile(plan_prop_ranges[i], 25),
                "med": np.median(plan_prop_ranges[i]),
                "q3": np.percentile(plan_prop_ranges[i], 75),
                "max": max(plan_prop_ranges[i])
            }
            summary[state][DESIRED_POP].append(prop_stats)
        open("boxplot_output_"+state+".json", "w").write(json.dumps(summary[state]))