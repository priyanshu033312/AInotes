import type { DocumentRecord, StudyMaterial } from "./types";

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 86_400_000).toISOString();

const heatExchangerText = `UNIT 3 — HEAT EXCHANGERS
3.1 Introduction
A heat exchanger is a device used to transfer heat between two or more fluids that are at different temperatures and are separated by a solid wall. Heat exchangers are widely used in power plants, refrigeration and air-conditioning systems, chemical processing, food processing and automotive cooling systems.

3.2 Classification of Heat Exchangers
Heat exchangers may be classified according to transfer process, constructional features and flow arrangement.
(a) Direct contact heat exchangers: hot and cold fluids mix directly, for example a cooling tower.
(b) Indirect contact heat exchangers: the fluids remain separated by a wall, for example a shell and tube heat exchanger.
According to flow arrangement, exchangers are classified as parallel flow, counter flow and cross flow. In parallel flow both fluids enter at the same end and leave at the same end, so the outlet temperature of the cold fluid can never exceed the outlet temperature of the hot fluid. In counter flow the fluids enter at opposite ends; the cold fluid outlet can approach the hot fluid inlet and the logarithmic mean temperature difference is larger.
According to construction, exchangers are tubular (double pipe, shell and tube) or plate type (plate and frame, spiral).

3.3 Overall Heat Transfer Coefficient
The rate of heat transfer is given by
Q = U A ΔT_m
where U is the overall heat transfer coefficient in W/m2K, A is the heat transfer area in m2 and ΔT_m is the mean temperature difference.
For a plane wall, 1/U = 1/h_i + L/k + 1/h_o
where h_i and h_o are the convective heat transfer coefficients on the inner and outer surfaces, L is the wall thickness and k is the thermal conductivity of the wall material.

3.4 Logarithmic Mean Temperature Difference
For parallel flow, ΔT1 = T_h1 - T_c1 and ΔT2 = T_h2 - T_c2.
For counter flow, ΔT1 = T_h1 - T_c2 and ΔT2 = T_h2 - T_c1.
The logarithmic mean temperature difference is
ΔT_lm = (ΔT1 - ΔT2) / ln(ΔT1/ΔT2)
The correction factor F is applied for multipass and cross flow exchangers so that Q = U A F ΔT_lm.

3.5 Effectiveness-NTU Method
The LMTD method requires the outlet temperatures to be known. When outlet temperatures are unknown, the effectiveness-NTU method is used.
Effectiveness ε = Q_actual / Q_max
Q_max = C_min (T_h1 - T_c1)
where C = m Cp is the heat capacity rate. NTU = U A / C_min.
For a counter flow exchanger, ε = (1 - exp[-NTU(1 - C_r)]) / (1 - C_r exp[-NTU(1 - C_r)]), where C_r = C_min/C_max.

3.6 Fouling and Performance
Fouling is the deposition of unwanted material on heat transfer surfaces. It increases thermal resistance, reduces U and increases pressure drop. The fouling factor R_f is added as 1/U_dirty = 1/U_clean + R_f.
Fouling is controlled by water treatment, filtration, velocity limits and periodic cleaning.

3.7 Heat Exchanger Effectiveness
Effectiveness depends on flow arrangement. For equal NTU and equal heat capacity rates, a counter flow exchanger has the highest effectiveness, followed by cross flow and then parallel flow. This is because the mean temperature difference is largest in counter flow.

3.8 Worked Example
A double pipe counter flow heat exchanger heats 1.2 kg/s of water from 25 C to 65 C using oil entering at 120 C with a heat capacity rate of 1.6 kW/K. Cp of water is 4.18 kJ/kgK.
Q = m Cp ΔT = 1.2 x 4.18 x 40 = 200.6 kW.
Oil outlet temperature: T_h2 = 120 - 200.6/1.6 = 47.4 C.
ΔT1 = 120 - 65 = 55 K, ΔT2 = 47.4 - 25 = 22.4 K.
ΔT_lm = (55 - 22.4)/ln(55/22.4) = 36.4 K.
If U = 900 W/m2K, then A = Q/(U ΔT_lm) = 200600/(900 x 36.4) = 6.1 m2.

3.9 Summary
Counter flow gives the highest effectiveness for a given surface area. LMTD is used when terminal temperatures are known; the effectiveness-NTU method is used when they are not. Fouling must be accounted for in the design of every industrial exchanger.`;

const secondLawText = `UNIT 2 — THE SECOND LAW OF THERMODYNAMICS
2.1 Limitations of the First Law
The first law of thermodynamics is a statement of energy conservation. It cannot explain the direction of a process. A cup of hot coffee cools to room temperature, but a cup at room temperature never spontaneously heats up by taking energy from the surroundings, even though such a process would conserve energy.

2.2 Kelvin-Planck Statement
It is impossible for any device that operates on a thermodynamic cycle to receive heat from a single thermal reservoir and produce a net amount of work.

2.3 Clausius Statement
It is impossible to construct a device that operates in a cycle and produces no other effect than the transfer of heat from a lower temperature body to a higher temperature body.

2.4 Reversible and Irreversible Processes
A reversible process is one that can be reversed without leaving any trace on the surroundings. Friction, unrestrained expansion, heat transfer across a finite temperature difference and mixing of two different gases are irreversible processes. All actual processes are irreversible.

2.5 Carnot Cycle and Carnot Efficiency
The Carnot cycle consists of two reversible isothermal processes and two reversible adiabatic processes. Its thermal efficiency is
η_Carnot = 1 - T_L / T_H
where temperatures are in kelvin. No heat engine operating between two reservoirs can be more efficient than a reversible engine operating between the same reservoirs.

2.6 Entropy
Entropy is a measure of molecular disorder. For a reversible process, dS = δQ_rev / T. The entropy of an isolated system always increases: ΔS_total ≥ 0. This is the entropy statement of the second law.
The entropy change of an ideal gas is ΔS = m [Cp ln(T2/T1) - R ln(P2/P1)].

2.7 Coefficient of Performance
For a refrigerator, COP = Q_L / W_net,in. For a heat pump, COP = Q_H / W_net,in. The maximum COP is obtained with reversible cycles: COP_R,max = T_L / (T_H - T_L).

2.8 Summary
The second law fixes the direction of processes and limits the performance of all real devices. Carnot efficiency is the upper bound for heat engines, and the increase of entropy principle is used to check whether a process is possible.`;

function heatExchangerStudy(): StudyMaterial {
  return {
    title: "Heat Exchangers and Heat Transfer",
    subject: "Thermal Engineering · Unit 3",
    overview:
      "This unit explains how heat moves between two fluids without them mixing, how engineers size a heat exchanger, and why counter flow beats parallel flow. It covers classification, the overall heat transfer coefficient, the LMTD and effectiveness-NTU methods, fouling, and a fully worked design example.",
    learningObjectives: [
      "Classify heat exchangers by transfer process, construction and flow arrangement.",
      "Apply Q = U·A·ΔT_lm to size a heat exchanger surface area.",
      "Choose between the LMTD method and the effectiveness-NTU method.",
      "Explain why counter flow has a higher effectiveness than parallel flow.",
      "Account for fouling resistance in a real design calculation.",
    ],
    chapters: [
      {
        id: "ch-1",
        title: "3.1 What a Heat Exchanger Really Does",
        summary:
          "A heat exchanger moves thermal energy from a hot fluid to a cold fluid through a solid wall, without the two fluids touching. Its only job is to move heat, not to generate it.",
        keyPoints: [
          "Two fluids at different temperatures, separated by a wall.",
          "Heat always flows from the hotter fluid to the colder fluid — never the reverse.",
          "The wall is a resistance, not an insulator: the thinner and more conductive it is, the better the transfer.",
          "Used in power plants, refrigeration, HVAC, chemical plants and vehicle cooling.",
          "Direct contact exchangers mix the fluids; indirect contact exchangers keep them separate.",
        ],
        definitions: [
          {
            term: "Heat exchanger",
            definition:
              "A device that transfers heat between two or more fluids at different temperatures, with the fluids separated by a solid wall.",
          },
          {
            term: "Direct contact heat exchanger",
            definition:
              "An exchanger in which hot and cold fluids mix directly, such as a cooling tower.",
          },
        ],
        formulas: [
          {
            expression: "Q = ṁ · C_p · ΔT",
            meaning:
              "Sensible heat gained or lost by one fluid, in watts when ṁ is kg/s and C_p is J/kg·K.",
          },
        ],
        examples: [
          "A car radiator: hot coolant inside the tubes, air outside, heat leaves the coolant and enters the air.",
          "In a cooling tower the water actually touches the air — that is direct contact.",
        ],
        source: "Extract: §3.1–3.2, pp. 41–43",
      },
      {
        id: "ch-2",
        title: "3.2 Flow Arrangements: Parallel vs Counter",
        summary:
          "In parallel flow both fluids enter at the same end. In counter flow they enter at opposite ends. Counter flow keeps a larger temperature difference across the whole exchanger, so it transfers more heat for the same area.",
        keyPoints: [
          "Parallel flow: cold outlet can never be hotter than the hot outlet — the temperatures converge.",
          "Counter flow: the cold fluid outlet can approach the hot fluid inlet temperature.",
          "For the same U, A and flow rates, counter flow always has the larger ΔT_lm.",
          "Cross flow sits between the two in performance and is used in compact plate/finned exchangers.",
          "Multipass and cross-flow designs need a correction factor F < 1 applied to ΔT_lm.",
        ],
        definitions: [
          {
            term: "Parallel flow",
            definition:
              "A flow arrangement in which the hot and cold fluids enter at the same end and travel in the same direction.",
          },
          {
            term: "Counter flow",
            definition:
              "A flow arrangement in which the hot and cold fluids enter at opposite ends and travel in opposite directions.",
          },
        ],
        formulas: [
          {
            expression: "Q = U · A · F · ΔT_lm",
            meaning:
              "Design equation for multipass/cross-flow units; F is read from charts for the given P and R ratios.",
          },
        ],
        examples: [
          "A car radiator is cross flow (air across tubes).",
          "A double-pipe oil cooler is normally piped in counter flow.",
        ],
        source: "Extract: §3.2 and §3.4, pp. 43–48",
      },
      {
        id: "ch-3",
        title: "3.3 Overall Heat Transfer Coefficient and LMTD",
        summary:
          "The overall coefficient U combines the two convection films and the wall conduction into one number. Because the temperature difference changes along the exchanger, the driving force is the logarithmic mean temperature difference, not the arithmetic average.",
        keyPoints: [
          "1/U = 1/h_i + L/k + 1/h_o for a clean plane wall.",
          "The smallest h dominates U — that film is the bottleneck.",
          "ΔT_lm = (ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂), with ΔT₁ and ΔT₂ taken at the two ends.",
          "For counter flow the end differences are ΔT₁ = T_h1 − T_c2 and ΔT₂ = T_h2 − T_c1.",
          "If ΔT₁ ≈ ΔT₂ the logarithmic mean equals the arithmetic mean.",
        ],
        definitions: [
          {
            term: "Overall heat transfer coefficient (U)",
            definition:
              "The combined thermal conductance of the two convection films and the separating wall, in W/m²·K.",
          },
          {
            term: "Logarithmic mean temperature difference (ΔT_lm)",
            definition:
              "The effective average temperature difference between the two fluids over the length of the exchanger.",
          },
        ],
        formulas: [
          {
            expression: "1/U = 1/h_i + L/k + 1/h_o",
            meaning: "Series thermal resistance for a clean plane wall.",
          },
          {
            expression: "ΔT_lm = (ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂)",
            meaning: "Logarithmic mean temperature difference between the two ends.",
          },
        ],
        examples: [
          "If h_i = 5000 and h_o = 40 W/m²K, then 1/U ≈ 1/40 — the gas-side film controls the design.",
        ],
        source: "Extract: §3.3–3.4, pp. 44–47",
      },
      {
        id: "ch-4",
        title: "3.4 Effectiveness-NTU and Fouling",
        summary:
          "When outlet temperatures are unknown, use ε-NTU. Effectiveness compares actual heat transfer with the thermodynamic maximum. Fouling adds a resistance that steadily erodes performance, so design must include a fouling allowance.",
        keyPoints: [
          "ε = Q_actual / Q_max and Q_max = C_min (T_h1 − T_c1).",
          "NTU = U·A / C_min; C_r = C_min / C_max.",
          "Counter flow gives the highest ε for a given NTU.",
          "1/U_dirty = 1/U_clean + R_f.",
          "Fouling raises ΔP and reduces U — both must be watched in operation.",
        ],
        definitions: [
          {
            term: "Effectiveness (ε)",
            definition:
              "The ratio of actual heat transfer to the maximum possible heat transfer for the given inlet conditions.",
          },
          {
            term: "NTU",
            definition:
              "Number of transfer units, NTU = U·A/C_min — a dimensionless measure of exchanger size.",
          },
          {
            term: "Fouling factor (R_f)",
            definition:
              "An additional thermal resistance caused by deposits on the heat transfer surface, in m²·K/W.",
          },
        ],
        formulas: [
          {
            expression: "ε = Q / (C_min (T_h1 − T_c1))",
            meaning: "Definition of effectiveness for any exchanger.",
          },
          {
            expression: "NTU = U·A / C_min",
            meaning: "Dimensionless size of the exchanger relative to the limiting capacity rate.",
          },
          {
            expression: "1/U_dirty = 1/U_clean + R_f",
            meaning: "Fouling is added as a series resistance.",
          },
        ],
        examples: [
          "A condenser with ε = 0.75 delivers 75% of the maximum possible heat transfer.",
          "A chiller that slowly loses capacity over a year is usually fouling, not a failed pump.",
        ],
        source: "Extract: §3.5–3.7, pp. 48–52",
      },
    ],
    difficultConcepts: [
      {
        id: "dc-1",
        title: "Why counter flow beats parallel flow",
        simpleExplanation:
          "In parallel flow the two streams start far apart in temperature and then rush towards each other. Near the exit they are almost at the same temperature, so very little heat can still move. In counter flow the streams are always far apart: the cold fluid leaves right next to the hot inlet, where the difference is largest. A large difference maintained over the whole length means more heat for the same metal.",
        steps: [
          "Both fluids enter and leave at fixed temperatures determined by the duty.",
          "In parallel flow the hot and cold outlets sit at the same end, so the outlet difference is small.",
          "In counter flow the cold outlet sits against the hot inlet, so the end difference stays large.",
          "ΔT_lm weights the whole length: a bigger end difference lifts the mean.",
          "Higher ΔT_lm means more Q for the same U and A, or less A for the same Q.",
        ],
        example:
          "Take hot 120 → 60 °C and cold 25 → 55 °C. Parallel: ΔT₁ = 95 K, ΔT₂ = 5 K, ΔT_lm ≈ 28.6 K. Counter: ΔT₁ = 65 K, ΔT₂ = 35 K, ΔT_lm ≈ 48.4 K — about 70% more driving force.",
        analogy:
          "Think of two people walking along a corridor. Parallel flow is both walking the same way at different speeds: eventually they walk side by side and no further gap exists. Counter flow is walking towards each other: the gap stays large until the very end.",
        sourceNote:
          "Explanation added by NoteWise. The 70% figure follows directly from the ΔT_lm definition in §3.4.",
        diagram: {
          type: "compare",
          title: "Temperature profiles: parallel vs counter flow",
          caption:
            "Counter flow keeps both end differences large, so the logarithmic mean temperature difference is higher.",
          columns: ["Parallel flow", "Counter flow"],
          nodes: [
            { id: "p1", label: "Hot in 120 °C", note: "same end" },
            { id: "p2", label: "Hot out 60 °C" },
            { id: "p3", label: "Cold in 25 °C", note: "same end" },
            { id: "p4", label: "Cold out 55 °C" },
            { id: "c1", label: "Hot in 120 °C", note: "opposite ends" },
            { id: "c2", label: "Hot out 60 °C" },
            { id: "c3", label: "Cold in 25 °C" },
            { id: "c4", label: "Cold out 55 °C", note: "opposite ends" },
          ],
          edges: [
            { from: "p1", to: "p2", label: "hot stream" },
            { from: "p3", to: "p4", label: "cold stream" },
            { from: "c1", to: "c2", label: "hot stream" },
            { from: "c3", to: "c4", label: "cold stream" },
          ],
        },
      },
      {
        id: "dc-2",
        title: "LMTD vs effectiveness-NTU — which one to use",
        simpleExplanation:
          "Both methods describe the same physics. LMTD needs all four terminal temperatures, which you rarely know at the start of a design. ε-NTU works from what you do know — the inlet temperatures, flow rates and the size of the exchanger — and gives you the outlet temperatures.",
        steps: [
          "Check whether both outlet temperatures are known.",
          "If yes, compute ΔT_lm and find Q or A from Q = U·A·F·ΔT_lm.",
          "If no, compute C_min, C_max and C_r = C_min/C_max.",
          "Compute NTU = U·A/C_min.",
          "Read or calculate ε from the chart/relation for the flow arrangement.",
          "Get Q = ε · C_min · (T_h1 − T_c1), then find the outlet temperatures.",
        ],
        example:
          "In the worked example of §3.8 the oil outlet was unknown; solve it with ε-NTU: C_min = 1.6 kW/K, C_r = 0.93, obtain ε then Q, then T_h2.",
        analogy:
          "LMTD is like a balance sheet you fill after the month is over. ε-NTU is a forecast: you put in the inputs you control and it tells you what will happen.",
        sourceNote:
          "Explanation added by NoteWise. Method selection follows standard practice; the numbers match §3.8.",
        diagram: {
          type: "flow",
          title: "Choosing the right sizing method",
          nodes: [
            { id: "n1", label: "Are both outlet temperatures known?" },
            { id: "n2", label: "LMTD method", note: "Q = U·A·F·ΔT_lm" },
            { id: "n3", label: "ε-NTU method", note: "Q = ε·C_min·ΔT_max" },
            { id: "n4", label: "Solve for the missing quantity", note: "Q, A or an outlet temperature" },
            { id: "n5", label: "Check fouling allowance", note: "1/U_dirty = 1/U_clean + R_f" },
          ],
          edges: [
            { from: "n1", to: "n2", label: "yes" },
            { from: "n1", to: "n3", label: "no" },
            { from: "n2", to: "n4" },
            { from: "n3", to: "n4" },
            { from: "n4", to: "n5" },
          ],
        },
      },
      {
        id: "dc-3",
        title: "The bottleneck film inside the overall coefficient",
        simpleExplanation:
          "Heat has to cross three resistances in series: the inside fluid film, the metal wall, and the outside fluid film. Resistances add, so the largest one decides the overall performance. Improving any other resistance barely helps.",
        steps: [
          "Write the resistance network: 1/h_i, L/k, 1/h_o.",
          "Compute each resistance numerically.",
          "Find the largest value — that is the controlling resistance.",
          "Improve that film: raise velocity, add fins, clean the surface.",
          "Recompute U; the gain is limited by the remaining resistances.",
        ],
        example:
          "1/h_i = 0.0002, L/k = 0.00005, 1/h_o = 0.025 m²·K/W. U = 39.6 W/m²K. Doubling the inside film changes U to 39.7 — almost nothing. Halving the outside film gives U ≈ 76 — nearly double.",
        analogy:
          "A queue at a toll booth. Making the fast lane faster does not help if everyone is stuck behind one slow booth at the exit.",
        sourceNote:
          "Explanation added by NoteWise using the resistance form of §3.3.",
        diagram: {
          type: "block",
          title: "Thermal resistance network for a plane wall",
          caption: "Resistances in series add, exactly like electrical resistors.",
          nodes: [
            { id: "r1", label: "Hot fluid film", note: "1/h_i" },
            { id: "r2", label: "Wall conduction", note: "L/k" },
            { id: "r3", label: "Cold fluid film", note: "1/h_o" },
            { id: "r4", label: "Fouling layers", note: "R_f,i + R_f,o" },
          ],
          edges: [
            { from: "r1", to: "r2", label: "Q" },
            { from: "r2", to: "r3", label: "Q" },
            { from: "r3", to: "r4", label: "Q" },
          ],
        },
      },
    ],
    diagrams: [
      {
        type: "mindmap",
        title: "Heat exchanger classification",
        caption: "Three independent ways to classify the same device.",
        nodes: [
          { id: "root", label: "Heat exchangers" },
          { id: "a", label: "By transfer", note: "direct / indirect" },
          { id: "b", label: "By construction", note: "tubular / plate" },
          { id: "c", label: "By flow", note: "parallel / counter / cross" },
          { id: "a1", label: "Direct contact", note: "cooling tower" },
          { id: "a2", label: "Indirect contact", note: "shell & tube" },
          { id: "b1", label: "Double pipe" },
          { id: "b2", label: "Shell and tube" },
          { id: "b3", label: "Plate and frame" },
          { id: "c1", label: "Parallel" },
          { id: "c2", label: "Counter" },
          { id: "c3", label: "Cross" },
        ],
        edges: [
          { from: "root", to: "a" },
          { from: "root", to: "b" },
          { from: "root", to: "c" },
          { from: "a", to: "a1" },
          { from: "a", to: "a2" },
          { from: "b", to: "b1" },
          { from: "b", to: "b2" },
          { from: "b", to: "b3" },
          { from: "c", to: "c1" },
          { from: "c", to: "c2" },
          { from: "c", to: "c3" },
        ],
      },
      {
        type: "flow",
        title: "Design workflow for a new exchanger",
        nodes: [
          { id: "s1", label: "Fix duty Q", note: "from process heat balance" },
          { id: "s2", label: "Select flow arrangement", note: "counter flow if possible" },
          { id: "s3", label: "Estimate U", note: "film coefficients + wall + fouling" },
          { id: "s4", label: "Compute ΔT_lm", note: "with correction factor F" },
          { id: "s5", label: "Area A = Q / (U·F·ΔT_lm)" },
          { id: "s6", label: "Check pressure drop and velocity limits" },
        ],
        edges: [
          { from: "s1", to: "s2" },
          { from: "s2", to: "s3" },
          { from: "s3", to: "s4" },
          { from: "s4", to: "s5" },
          { from: "s5", to: "s6" },
        ],
      },
      {
        type: "block",
        title: "Where the heat actually goes",
        caption: "The wall is a resistance between two convection films.",
        nodes: [
          { id: "hot", label: "Hot fluid", note: "T_h, ṁ_h" },
          { id: "film1", label: "Inside film", note: "h_i" },
          { id: "wall", label: "Tube wall", note: "k, L" },
          { id: "film2", label: "Outside film", note: "h_o" },
          { id: "cold", label: "Cold fluid", note: "T_c, ṁ_c" },
        ],
        edges: [
          { from: "hot", to: "film1", label: "Q" },
          { from: "film1", to: "wall", label: "Q" },
          { from: "wall", to: "film2", label: "Q" },
          { from: "film2", to: "cold", label: "Q" },
        ],
      },
    ],
    questions: [
      {
        question:
          "Derive the expression for logarithmic mean temperature difference for a counter flow heat exchanger.",
        answer:
          "Consider a differential element where the hot fluid falls by dT_h and the cold rises by dT_c. dQ = −ṁ_h C_ph dT_h = ṁ_c C_pc dT_c, and dQ = U dA (T_h − T_c). Writing ΔT = T_h − T_c gives d(ΔT) = −dQ(1/C_h + 1/C_c). Integrating from end 1 to end 2 and rearranging yields ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂).",
        marks: 8,
        difficulty: "hard",
      },
      {
        question:
          "Why can the cold fluid outlet temperature never exceed the hot fluid outlet temperature in a parallel flow exchanger?",
        answer:
          "Heat can only flow from hot to cold. As the fluids move together their temperatures approach each other asymptotically, and once equal no further heat transfer is possible. So T_c,out ≤ T_h,out always.",
        marks: 4,
        difficulty: "easy",
      },
      {
        question:
          "A counter flow exchanger has U = 500 W/m²K, A = 4 m², C_h = 2 kW/K and C_c = 1.5 kW/K. Hot inlet 150 °C, cold inlet 30 °C. Find effectiveness using C_r and NTU.",
        answer:
          "C_min = 1.5 kW/K, C_r = 0.75, NTU = 500×4/1500 = 1.333. For counter flow ε = (1 − e^(−NTU(1−C_r)))/(1 − C_r e^(−NTU(1−C_r))) = (1 − e^(−0.333))/(1 − 0.75 e^(−0.333)) = 0.2835/0.5396 ≈ 0.525. Then Q = 0.525×1.5×120 = 94.5 kW.",
        marks: 10,
        difficulty: "hard",
      },
      {
        question: "Define fouling factor and explain two methods of controlling fouling.",
        answer:
          "The fouling factor R_f is the additional thermal resistance due to deposits on the heat transfer surface, added as 1/U_dirty = 1/U_clean + R_f. Control methods include feed-water treatment/softening to prevent scale, filtration to remove suspended solids, keeping tube velocity above the deposition threshold, and periodic mechanical or chemical cleaning.",
        marks: 5,
        difficulty: "medium",
      },
      {
        question: "State two limitations of the LMTD method.",
        answer:
          "It requires all four terminal temperatures to be known, and for multipass or cross-flow units an empirical correction factor F must be read from charts. It also becomes numerically unstable when ΔT₁ ≈ ΔT₂.",
        marks: 4,
        difficulty: "medium",
      },
      {
        question:
          "Compare the surface area required by parallel and counter flow for the same duty and U.",
        answer:
          "A = Q/(U ΔT_lm). Counter flow has a larger ΔT_lm for identical terminal temperatures, so it needs less area. With hot 120→60 °C and cold 25→55 °C, ΔT_lm is 28.6 K parallel versus 48.4 K counter, so counter flow needs roughly 41% less area.",
        marks: 6,
        difficulty: "medium",
      },
    ],
    revision: {
      definitions: [
        {
          term: "Overall heat transfer coefficient",
          definition:
            "Combined conductance of both films and the wall, U, in W/m²·K.",
        },
        {
          term: "LMTD",
          definition:
            "Logarithmic mean of the temperature differences at the two ends of the exchanger.",
        },
        {
          term: "Effectiveness ε",
          definition: "Actual heat transfer divided by the thermodynamic maximum.",
        },
        {
          term: "NTU",
          definition: "U·A/C_min, a dimensionless measure of exchanger size.",
        },
        {
          term: "Fouling factor",
          definition: "Extra thermal resistance caused by surface deposits.",
        },
      ],
      formulas: [
        { expression: "Q = U·A·F·ΔT_lm", meaning: "Design equation" },
        {
          expression: "ΔT_lm = (ΔT₁ − ΔT₂)/ln(ΔT₁/ΔT₂)",
          meaning: "Mean driving force",
        },
        {
          expression: "1/U = 1/h_i + L/k + 1/h_o",
          meaning: "Clean plane wall",
        },
        { expression: "NTU = U·A/C_min", meaning: "Exchanger size" },
        {
          expression: "ε = Q/(C_min(T_h1 − T_c1))",
          meaning: "Effectiveness definition",
        },
        {
          expression: "1/U_dirty = 1/U_clean + R_f",
          meaning: "Fouling allowance",
        },
      ],
      keyPoints: [
        "Counter flow always wins on effectiveness.",
        "The smallest film coefficient controls U.",
        "Use ε-NTU when outlet temperatures are unknown.",
        "Fouling wastes both heat transfer and pumping power.",
        "Cross flow and multipass need the correction factor F.",
      ],
      differences: [
        {
          conceptA: "LMTD method",
          conceptB: "ε-NTU method",
          points: [
            "LMTD needs all four terminal temperatures.",
            "ε-NTU needs inlet temperatures, flow rates and area.",
            "LMTD is convenient for rating an existing unit.",
            "ε-NTU is convenient for sizing a new unit.",
          ],
        },
        {
          conceptA: "Parallel flow",
          conceptB: "Counter flow",
          points: [
            "Parallel: both fluids enter at the same end.",
            "Counter: fluids enter at opposite ends.",
            "Counter has the larger ΔT_lm and higher ε.",
            "Parallel protects against boiling in one pass but wastes area.",
          ],
        },
      ],
      examTopics: [
        "Derive ΔT_lm for counter flow.",
        "Numerical on effectiveness-NTU with C_r.",
        "Explain fouling and its effect on U.",
        "Compare flow arrangements with temperature profiles.",
        "Design a double-pipe exchanger from a heat balance.",
      ],
    },
    generatedBy: "ai",
    model: "curated-sample",
    warnings: [
      "This is a bundled sample so you can explore the workspace before uploading your own document.",
    ],
    generatedAt: daysAgo(2),
  };
}

function secondLawStudy(): StudyMaterial {
  return {
    title: "The Second Law of Thermodynamics",
    subject: "Engineering Thermodynamics · Unit 2",
    overview:
      "The first law tells you that energy is conserved. The second law tells you which of those energy-conserving processes actually happen. This unit covers the Kelvin-Planck and Clausius statements, reversibility, Carnot efficiency and entropy.",
    learningObjectives: [
      "State the Kelvin-Planck and Clausius statements and show they are equivalent.",
      "Compute Carnot efficiency and the maximum COP of a refrigerator.",
      "Apply the increase of entropy principle to test a process.",
    ],
    chapters: [
      {
        id: "ch-1",
        title: "2.1 Why the First Law Is Not Enough",
        summary:
          "Energy conservation alone allows impossible processes. The second law adds direction: heat flows from hot to cold, and work can be fully converted into heat but not the reverse.",
        keyPoints: [
          "The first law is a book-keeping statement, not a direction statement.",
          "A process that conserves energy can still be impossible.",
          "The second law introduces irreversibility and limits efficiency.",
        ],
        definitions: [
          {
            term: "Reversible process",
            definition:
              "A process that can be reversed without leaving any trace on its surroundings.",
          },
          {
            term: "Irreversibility",
            definition:
              "Any effect such as friction, unrestrained expansion or finite-ΔT heat transfer that prevents a process from being reversed.",
          },
        ],
        formulas: [],
        examples: [
          "A cup of coffee cools by itself; it never reheats by taking energy from the room.",
        ],
        source: "Extract: §2.1, §2.4",
      },
      {
        id: "ch-2",
        title: "2.2 Carnot Limit, Entropy and COP",
        summary:
          "No engine between two reservoirs can beat the reversible Carnot efficiency, and every isolated system's entropy rises. These two facts cap the performance of all real power plants, refrigerators and heat pumps.",
        keyPoints: [
          "η_Carnot = 1 − T_L/T_H with absolute temperatures.",
          "COP_R,max = T_L/(T_H − T_L).",
          "ΔS_total ≥ 0 for an isolated system.",
          "Real devices always fall short of the reversible limits.",
        ],
        definitions: [
          {
            term: "Entropy",
            definition:
              "A property measuring molecular disorder; dS = δQ_rev/T for a reversible path.",
          },
          {
            term: "Carnot cycle",
            definition:
              "A reversible cycle of two isothermal and two adiabatic processes operating between two reservoirs.",
          },
        ],
        formulas: [
          {
            expression: "η = 1 − T_L/T_H",
            meaning: "Carnot thermal efficiency (kelvin).",
          },
          {
            expression: "COP_R = T_L/(T_H − T_L)",
            meaning: "Maximum refrigerator COP.",
          },
          {
            expression: "ΔS ≥ 0",
            meaning: "Increase of entropy principle.",
          },
        ],
        examples: [
          "A refrigerator at 4 °C in a 32 °C room has a maximum COP of 277/28 ≈ 9.9; real units reach 3–4.",
        ],
        source: "Extract: §2.3, §2.5–2.7",
      },
    ],
    difficultConcepts: [
      {
        id: "dc-1",
        title: "Why Carnot efficiency uses kelvin",
        simpleExplanation:
          "Efficiency is a ratio of heat quantities, and those heats are proportional to absolute temperature through Q_H/T_H = Q_L/T_L for a reversible cycle. Celsius has an arbitrary zero, so ratios taken in Celsius are meaningless.",
        steps: [
          "For a reversible cycle, Q_H/T_H = Q_L/T_L.",
          "Efficiency is 1 − Q_L/Q_H.",
          "Substitute the temperature ratio: η = 1 − T_L/T_H.",
          "Convert both temperatures to kelvin before substituting.",
        ],
        example:
          "With T_H = 500 K and T_L = 300 K, η = 40%. Using 227 °C and 27 °C would wrongly give 88%.",
        analogy:
          "Measuring a ratio from an arbitrary zero is like measuring a person's height from sea level on a mountain: the numbers change, the physics does not.",
        diagram: {
          type: "flow",
          title: "Carnot cycle energy chain",
          nodes: [
            { id: "h", label: "Q_H from hot reservoir", note: "T_H" },
            { id: "e", label: "Reversible engine", note: "η = 1 − T_L/T_H" },
            { id: "w", label: "Work output W_net" },
            { id: "l", label: "Q_L rejected", note: "T_L" },
          ],
          edges: [
            { from: "h", to: "e" },
            { from: "e", to: "w" },
            { from: "e", to: "l" },
          ],
        },
      },
      {
        id: "dc-2",
        title: "Entropy as a measure of lost opportunity",
        simpleExplanation:
          "Entropy generation counts how much potential for work has been permanently destroyed. Friction turns ordered motion into random molecular motion: the energy is still there, but you can no longer extract it as work.",
        steps: [
          "Identify the system and its boundary.",
          "Compute entropy change of each reservoir from Q/T.",
          "Sum the changes including the system.",
          "A positive total means the process is irreversible; a negative total is impossible.",
        ],
        example:
          "Heat 1000 J from a 500 K reservoir to a 300 K room: ΔS = −2 + 3.33 = +1.33 J/K. Work potential lost is T₀ΔS = 300 × 1.33 = 400 J.",
        analogy:
          "Spilling a bucket of water on the floor: the water is not gone, but you can no longer use its height to turn a wheel.",
        diagram: {
          type: "compare",
          title: "Reversible vs irreversible",
          columns: ["Reversible", "Irreversible"],
          nodes: [
            { id: "r1", label: "ΔS_total = 0" },
            { id: "r2", label: "Maximum work" },
            { id: "i1", label: "ΔS_total > 0" },
            { id: "i2", label: "Work lost to friction" },
          ],
        },
      },
    ],
    diagrams: [
      {
        type: "flow",
        title: "Second law logic chain",
        nodes: [
          { id: "a", label: "First law allows many processes" },
          { id: "b", label: "Second law restricts direction" },
          { id: "c", label: "Irreversibilities generate entropy" },
          { id: "d", label: "Efficiency capped by Carnot" },
          { id: "e", label: "Real devices fall short" },
        ],
        edges: [
          { from: "a", to: "b" },
          { from: "b", to: "c" },
          { from: "c", to: "d" },
          { from: "d", to: "e" },
        ],
      },
    ],
    questions: [
      {
        question: "Show that the Kelvin-Planck and Clausius statements are equivalent.",
        answer:
          "Assume a device violates Kelvin-Planck: it takes Q from a hot reservoir and produces work with no cold rejection. Use that work to drive a reversible refrigerator that extracts Q_L from a cold body and rejects Q_H = Q_L + W to the hot body. The net effect is heat moved from cold to hot with no external work, violating Clausius. The reverse argument is symmetric, so the two statements are equivalent.",
        marks: 8,
        difficulty: "hard",
      },
      {
        question:
          "A heat engine operates between 800 K and 300 K. Find the maximum efficiency and the work for 1000 kJ of heat input.",
        answer:
          "η = 1 − 300/800 = 62.5%. W_max = 0.625 × 1000 = 625 kJ.",
        marks: 4,
        difficulty: "easy",
      },
      {
        question: "Explain why all real processes are irreversible.",
        answer:
          "Every real process involves friction, finite-temperature-difference heat transfer, unrestricted expansion or mixing — each generates entropy. Since removing these effects entirely would require infinite time or zero gradients, no real process is fully reversible.",
        marks: 5,
        difficulty: "medium",
      },
    ],
    revision: {
      definitions: [
        {
          term: "Kelvin-Planck statement",
          definition:
            "No cyclic device can convert heat from a single reservoir entirely into work.",
        },
        {
          term: "Clausius statement",
          definition:
            "No cyclic device can move heat from cold to hot with no other effect.",
        },
        {
          term: "Entropy",
          definition: "dS = δQ_rev/T; a measure of disorder and lost work potential.",
        },
      ],
      formulas: [
        { expression: "η_Carnot = 1 − T_L/T_H", meaning: "Maximum engine efficiency" },
        {
          expression: "COP_R,max = T_L/(T_H − T_L)",
          meaning: "Maximum refrigerator COP",
        },
        { expression: "ΔS_total ≥ 0", meaning: "Increase of entropy principle" },
      ],
      keyPoints: [
        "Second law gives direction to processes.",
        "Carnot efficiency is an upper bound, never achieved in practice.",
        "Entropy generation equals lost work potential.",
      ],
      differences: [
        {
          conceptA: "First law",
          conceptB: "Second law",
          points: [
            "First law: energy is conserved.",
            "Second law: entropy of the universe increases.",
            "First law sets the quantity, second law sets the direction and quality.",
          ],
        },
      ],
      examTopics: [
        "Equivalence of the two statements.",
        "Carnot cycle efficiency derivation.",
        "Entropy balance for a heat exchanger.",
      ],
    },
    generatedBy: "local",
    model: "curated-sample",
    warnings: [
      "Bundled sample. Upload your own PDF or PPTX to generate material for your syllabus.",
    ],
    generatedAt: daysAgo(6),
  };
}

export function buildSampleDocument(): DocumentRecord {
  const study = heatExchangerStudy();
  return {
    id: "sample-heat-exchangers",
    ownerId: "local-user",
    name: "Thermal Engineering — Unit 3 Heat Exchangers.pdf",
    kind: "pdf",
    size: 3_412_736,
    pages: 24,
    charCount: heatExchangerText.length,
    status: "ready",
    stage: "done",
    createdAt: daysAgo(2),
    processedAt: daysAgo(2),
    isSample: true,
    textPreview: heatExchangerText,
    study,
  };
}

export function buildSecondSampleDocument(): DocumentRecord {
  const study = secondLawStudy();
  return {
    id: "sample-second-law",
    ownerId: "local-user",
    name: "Engineering Thermodynamics — Second Law.pdf",
    kind: "pdf",
    size: 1_884_160,
    pages: 16,
    charCount: secondLawText.length,
    status: "ready",
    stage: "done",
    createdAt: daysAgo(6),
    processedAt: daysAgo(6),
    isSample: true,
    textPreview: secondLawText,
    study,
  };
}

export const SAMPLE_DOCUMENTS = [buildSampleDocument, buildSecondSampleDocument];
