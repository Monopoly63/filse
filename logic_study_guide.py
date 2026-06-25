"""
Predicate Logic & First-Order Logic - Interactive Study Guide
15 Exercises with Solutions
"""

import sys

class LogicStudyGuide:
    def __init__(self):
        self.exercises = {
            1: {
                "title": "Predicate Classification by Arity",
                "category": "Classification",
                "problem": """
Classify each predicate as Unary, Binary, or Ternary, then write its reading:

1. Student(Mona)
2. Teaches(Nader, Logic)
3. Gives(Ali, Book, Sara)
4. Between(C, A, B)
""",
                "solution": """
┌─────────────────────────┬──────────┬─────────────────────────────────┬─────────────────────┐
│ Predicate               │ Type     │ Reason                          │ Arabic Reading      │
├─────────────────────────┼──────────┼─────────────────────────────────┼─────────────────────┤
│ Student(Mona)           │ Unary    │ Takes one argument              │ منى طالبة           │
│ Teaches(Nader, Logic)   │ Binary   │ Connects Nader and Logic        │ نادر يدرس المنطق   │
│ Gives(Ali, Book, Sara) │ Ternary  │ Giver, given thing, receiver    │ علي يعطي كتابا لسارة│
│ Between(C, A, B)        │ Ternary  │ Relationship needs 3 elements   │ C يقع بين A و B     │
└─────────────────────────┴──────────┴─────────────────────────────────┴─────────────────────┘
"""
            },
            2: {
                "title": "Complex General Rule Formulation",
                "category": "FOL Conversion",
                "problem": """
Convert the following sentence to First-Order Logic:

"Every student registered in university studies at least one course."
""",
                "solution": """
Step 1: Define Predicates
─────────────────────────
• Student(x)           : x is a student
• Registered(x, Univ)  : x is registered in university
• Course(y)            : y is a course
• Studies(x, y)        : x studies y

Step 2: Formula
──────────────
∀x((Student(x) ∧ Registered(x, University)) → ∃y(Course(y) ∧ Studies(x, y)))

Step 3: Explanation
───────────────────
For all x, if x is a student AND registered in university,
THEN there exists y such that y is a course AND x studies y.
"""
            },
            3: {
                "title": "Sentence with Negation and Existence",
                "category": "FOL Conversion",
                "problem": """
Convert the following sentence to First-Order Logic:

"There exists a student who does not like mathematics but likes programming."
""",
                "solution": """
Step 1: Define Predicates
─────────────────────────
• Student(x)              : x is a student
• Likes(x, Math)          : x likes mathematics
• Likes(x, Programming)   : x likes programming

Step 2: Formula
──────────────
∃x(Student(x) ∧ ¬Likes(x, Math) ∧ Likes(x, Programming))

Step 3: Explanation
───────────────────
This is an EXISTENTIAL statement because it asserts the existence
of at least one student who satisfies three properties:
1. Is a student
2. Does NOT like mathematics (¬Likes)
3. Likes programming
"""
            },
            4: {
                "title": "Quantifier Order Analysis",
                "category": "Quantifiers",
                "problem": """
Explain the logical difference between these two formulas:

1. ∀x ∃y Advises(y, x)
2. ∃y ∀x Advises(y, x)
""",
                "solution": """
First Formula: ∀x ∃y Advises(y, x)
═══════════════════════════════════
Meaning: For every person x, there exists some person y who advises x.
The advisor can be DIFFERENT for each person. Each person has their own advisor.

Second Formula: ∃y ∀x Advises(y, x)
═════════════════════════════════════
Meaning: There exists ONE SPECIFIC person y who advises ALL people.
This means there is a single universal advisor for everyone.

═══════════════════════════════════════════════════════════
CONCLUSION: The two formulas are NOT equivalent!
Changing the order of ∀ and ∃ changes the meaning.
═══════════════════════════════════════════════════════════
"""
            },
            5: {
                "title": "Correcting Quantifier Usage Error",
                "category": "FOL Conversion",
                "problem": """
The following formula was proposed to represent:
"Every doctor works in a hospital."

INCORRECT: ∀x Doctor(x) ∧ WorksIn(x, Hospital)

Correct it and explain why.
""",
                "solution": """
THE ERROR:
══════════
The incorrect formula means:
"Everything in the domain is a doctor AND works in a hospital"
This is NOT the intended meaning!

CORRECTED FORMULAS:
══════════════════
If referring to a SPECIFIC hospital named "Hospital":
───────────────────────────────────────────────────────
∀x(Doctor(x) → WorksIn(x, Hospital))

If meaning every doctor works in SOME hospital (more precise):
──────────────────────────────────────────────────────────
∀x(Doctor(x) → ∃y(Hospital(y) ∧ WorksIn(x, y)))

KEY POINT:
═════════
The second version is more accurate because it doesn't assume
all doctors work in the same specific hospital.
"""
            },
            6: {
                "title": "Direct Inference with Two Rules",
                "category": "Inference",
                "problem": """
Given the following knowledge base, derive the conclusion:

∀x (Researcher(x) → WritesPaper(x))
Researcher(Nora)
""",
                "solution": """
Step 1: Apply Universal Instantiation
════════════════════════════════════
Substitute Nora for x:
Researcher(Nora) → WritesPaper(Nora)

Step 2: Use the Given Fact
═══════════════════════════
Researcher(Nora)

Step 3: Apply Modus Ponens
══════════════════════════
Modus Ponens Rule: P → Q, P ∴ Q

Since we have Researcher(Nora) and
Researcher(Nora) → WritesPaper(Nora),
we conclude:

═══════════════════════════════════════════════════
✓ WritesPaper(Nora)
═══════════════════════════════════════════════════

Final Answer: Nora writes a paper (نورا تكتب بحثا)
"""
            },
            7: {
                "title": "Unification with Two Binary Predicates",
                "category": "Unification",
                "problem": """
Find the appropriate substitution to unify these two expressions:

Supervises(x, ProjectA)
Supervises(DrHadi, y)
""",
                "solution": """
Step 1: Find Substitutions
══════════════════════════
From the first argument:  x = DrHadi
From the second argument: y = ProjectA

Step 2: Unification Substitution
═════════════════════════════════
{x/DrHadi, y/ProjectA}

Step 3: Verify
════════════
After substitution, both expressions become:

═══════════════════════════════════════════════════
✓ Supervises(DrHadi, ProjectA)
═══════════════════════════════════════════════════

Unification SUCCESSFUL!
"""
            },
            8: {
                "title": "Unification Failure Case",
                "category": "Unification",
                "problem": """
Can these two expressions be unified? Explain:

Parent(x, x)
Parent(Ali, Sara)
""",
                "solution": """
Answer: NO - Unification FAILS
════════════════════════════════

REASON:
══════
The first expression requires that variable x takes
the SAME value in both positions.

But in the second expression:
• From first argument:  x = Ali
• From second argument: x = Sara

PROBLEM:
════════
Ali ≠ Sara

There is no single substitution that makes both
expressions identical.

═══════════════════════════════════════════════════
✗ Unification FAILED
═══════════════════════════════════════════════════
"""
            },
            9: {
                "title": "Forward Chaining - Extract All Results",
                "category": "Inference",
                "problem": """
Apply forward chaining to extract all new conclusions:

Student(Huda)
∀x (Student(x) → HasID(x))
∀x (HasID(x) → CanBorrowBooks(x))
""",
                "solution": """
Step 1: Start with Fact
══════════════════════
Student(Huda)

Step 2: Apply First Rule
════════════════════════
∀x (Student(x) → HasID(x))

Using Modus Ponens with Huda:
═══════════════════════════════════════════════════
✓ HasID(Huda)
═══════════════════════════════════════════════════

Step 3: Apply Second Rule
═════════════════════════
∀x (HasID(x) → CanBorrowBooks(x))

Using Modus Ponens with Huda:
═══════════════════════════════════════════════════
✓ CanBorrowBooks(Huda)
═══════════════════════════════════════════════════

NEW CONCLUSIONS:
═════════════════
1. HasID(Huda)
2. CanBorrowBooks(Huda)
"""
            },
            10: {
                "title": "Forward Chaining with Multiple Premises",
                "category": "Inference",
                "problem": """
Extract all possible conclusions:

Researcher(Nabil)
Publishes(Nabil)
∀x (Researcher(x) → Academic(x))
∀x (Publishes(x) → Active(x))
∀x (Academic(x) ∧ Active(x) → EligibleForGrant(x))
""",
                "solution": """
Step 1: From Researcher(Nabil)
══════════════════════════════
Apply: ∀x (Researcher(x) → Academic(x))
═══════════════════════════════════════════════════
✓ Academic(Nabil)
═══════════════════════════════════════════════════

Step 2: From Publishes(Nabil)
══════════════════════════════
Apply: ∀x (Publishes(x) → Active(x))
═══════════════════════════════════════════════════
✓ Active(Nabil)
═══════════════════════════════════════════════════

Step 3: Combine Results
════════════════════════
We have: Academic(Nabil) ∧ Active(Nabil)

Step 4: Apply Final Rule
════════════════════════
Apply: ∀x (Academic(x) ∧ Active(x) → EligibleForGrant(x))
═══════════════════════════════════════════════════
✓ EligibleForGrant(Nabil)
═══════════════════════════════════════════════════

ALL POSSIBLE CONCLUSIONS:
═════════════════════════
1. Academic(Nabil)
2. Active(Nabil)
3. EligibleForGrant(Nabil)
"""
            },
            11: {
                "title": "Backward Chaining - Prove Specific Goal",
                "category": "Inference",
                "problem": """
Use backward chaining to prove the goal:

Goal: CanGraduate(Samir)

∀x (CompletedCourses(x) → CanGraduate(x))
∀x (PassedAllExams(x) → CompletedCourses(x))
PassedAllExams(Samir)
""",
                "solution": """
Step 1: Start from Goal
════════════════════════
CanGraduate(Samir)

Step 2: Find Rule with This Conclusion
════════════════════════════════════════
Rule: ∀x (CompletedCourses(x) → CanGraduate(x))

To prove: CanGraduate(Samir), we need to prove:
→ CompletedCourses(Samir)

Step 3: Find Rule to Prove Sub-goal
═════════════════════════════════════
Rule: ∀x (PassedAllExams(x) → CompletedCourses(x))

To prove: CompletedCourses(Samir), we need to prove:
→ PassedAllExams(Samir)

Step 4: Check Knowledge Base
════════════════════════════════
═══════════════════════════════════════════════════
✓ PassedAllExams(Samir) - This is a FACT!
═══════════════════════════════════════════════════

═══════════════════════════════════════════════════
✓ CanGraduate(Samir) is PROVED!
═══════════════════════════════════════════════════
"""
            },
            12: {
                "title": "Proof Failure Due to Missing Fact",
                "category": "Inference",
                "problem": """
Can the following goal be proved? Explain:

Goal: ReceivesCertificate(Maya)

∀x (AttendedWorkshop(x) ∧ PassedTest(x) → ReceivesCertificate(x))
AttendedWorkshop(Maya)
""",
                "solution": """
Step 1: To Prove ReceivesCertificate(Maya)
════════════════════════════════════════════
We need BOTH conditions to be true:
1. AttendedWorkshop(Maya)
2. PassedTest(Maya)

Step 2: Check Knowledge Base
═══════════════════════════════════
✓ First condition EXISTS:
═══════════════════════════════════════════════════
✓ AttendedWorkshop(Maya)
═══════════════════════════════════════════════════

✗ Second condition MISSING:
═══════════════════════════════════════════════════
✗ PassedTest(Maya) - NOT in knowledge base!
═══════════════════════════════════════════════════

═══════════════════════════════════════════════════
✗ Cannot prove ReceivesCertificate(Maya)
═══════════════════════════════════════════════════

The knowledge base is INCOMPLETE - missing the fact
that Maya passed the test.
"""
            },
            13: {
                "title": "Applying Modus Tollens",
                "category": "Inference",
                "problem": """
Use Modus Tollens to extract the conclusion:

∀x (Verified(x) → Accepted(x))
¬Accepted(File7)
""",
                "solution": """
Step 1: Apply Universal Instantiation
══════════════════════════════════════
Apply the rule to File7:
Verified(File7) → Accepted(File7)

Step 2: Use Given Fact
══════════════════════
¬Accepted(File7)

Step 3: Apply Modus Tollens
═════════════════════════════
Modus Tollens Rule: P → Q, ¬Q ∴ ¬P

Since we have ¬Accepted(File7), we conclude:

═══════════════════════════════════════════════════
✓ ¬Verified(File7)
═══════════════════════════════════════════════════

Final Answer: File7 is not verified (الملف غير موثق)
"""
            },
            14: {
                "title": "Limitations of First-Order Logic",
                "category": "FOL Conversion",
                "problem": """
Why is it difficult to accurately represent the following sentence
in traditional First-Order Logic?

"Usually, diligent students succeed."
""",
                "solution": """
THE PROBLEM:
════════════
The word "usually" expresses PROBABILISTIC knowledge,
not a definitive judgment!

WHY FOL STRUGGLES:
══════════════════
Traditional First-Order Logic typically treats propositions as:
• Either TRUE or FALSE (binary)
• Does not easily represent degrees of probability
• Cannot handle uncertainty or ambiguity well

BETTER ALTERNATIVES:
══════════════════
To represent such sentences, we might need:
• Probabilistic Logic - handles uncertainty
• Fuzzy Logic - handles degrees of truth
• Statistical Models - handles likelihoods

═══════════════════════════════════════════════════
CONCLUSION:
The sentence is probabilistic, not definitive.
That's why traditional FOL cannot represent it accurately.
═══════════════════════════════════════════════════
"""
            },
            15: {
                "title": "Conversion and Inference Combined",
                "category": "FOL Conversion & Inference",
                "problem": """
Convert to FOL, then derive the conclusion:

"Everyone who attends training and completes the project gets a certificate."

AttendsTraining(Nada)
CompletesProject(Nada)
""",
                "solution": """
Step 1: Define Predicates
════════════════════════
• AttendsTraining(x)    : x attends training
• CompletesProject(x)   : x completes project
• ReceivesCertificate(x): x gets certificate

Step 2: General Rule
══════════════════════
∀x((AttendsTraining(x) ∧ CompletesProject(x)) → ReceivesCertificate(x))

Step 3: Given Facts
════════════════════
AttendsTraining(Nada)
CompletesProject(Nada)

Step 4: Combine Conditions
═════════════════════════
Both conditions are satisfied:
═══════════════════════════════════════════════════
✓ AttendsTraining(Nada) ∧ CompletesProject(Nada)
═══════════════════════════════════════════════════

Step 5: Apply Modus Ponens
════════════════════════════
═══════════════════════════════════════════════════
✓ ReceivesCertificate(Nada)
═══════════════════════════════════════════════════

Final Answer: Nada gets a certificate (ندى تحصل على شهادة)
"""
            }
        }

    def print_header(self):
        print("\n" + "="*70)
        print(" " * 15 + "🧠 PREDICATE LOGIC STUDY GUIDE 🧠")
        print(" " * 20 + "15 Exercises with Solutions")
        print("="*70 + "\n")

    def print_menu(self):
        print("\n" + "─"*70)
        print("AVAILABLE EXERCISES:")
        print("─"*70)
        for num, ex in self.exercises.items():
            print(f"  {num:2}. {ex['title']:40} [{ex['category']}]")
        print("─"*70)
        print("  0.  Exit")
        print("─"*70)

    def display_exercise(self, num):
        if num not in self.exercises:
            print("\n❌ Invalid exercise number!")
            return

        ex = self.exercises[num]
        print("\n" + "="*70)
        print(f"EXERCISE {num}: {ex['title']}")
        print(f"Category: {ex['category']}")
        print("="*70)
        print("\n📝 PROBLEM:")
        print("─"*70)
        print(ex['problem'])
        print("─"*70)

        input("\nPress Enter to see the solution...")

        print("\n✅ SOLUTION:")
        print("─"*70)
        print(ex['solution'])
        print("─"*70)

    def run(self):
        self.print_header()

        while True:
            self.print_menu()
            choice = input("\nEnter exercise number (0-15): ").strip()

            if choice == '0':
                print("\n👋 Good luck with your studies!")
                break

            try:
                num = int(choice)
                if 1 <= num <= 15:
                    self.display_exercise(num)
                else:
                    print("\n❌ Please enter a number between 0 and 15!")
            except ValueError:
                print("\n❌ Invalid input! Please enter a number.")

            input("\nPress Enter to continue...")
            print("\n" * 2)


def main():
    guide = LogicStudyGuide()
    guide.run()


if __name__ == "__main__":
    main()
