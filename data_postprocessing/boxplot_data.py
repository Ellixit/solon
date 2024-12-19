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

    for DESIRED_POP in DESIRED_POPS:
        summary[state][DESIRED_POP] = []

        current_dist_cnt = len(current_dist_data)

        plan_prop_ranges = [] # stores lists of smallest district values in each plan, second smallest, etc.
        for i in range(current_dist_cnt):
            plan_prop_ranges.append([])

        for i in range(PLAN_SIZE): # 5000 or 250, ensemble plan count
            plan_file = open("../seawulf/output/fix_official_fullensemble/"+str(i)+"_"+state+str(PLAN_SIZE)+".json", "rb")
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
#open("boxplot_output.json", "w").write(json.dumps(summary))
# open("../client/public/data/boxplot_sample.json", "w").write(json.dumps(summary))
        # open("../client/public/data/boxplot_sample/boxplot_sample_"+state+"_"+DESIRED_POP.replace("$", "").replace(" ", "_")+".json", "w").write(json.dumps(outl))