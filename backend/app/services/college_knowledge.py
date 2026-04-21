from typing import Dict, Optional


FAQ_RESPONSES = {
    "admission": {
        "keywords": [
            "admission",
            "apply",
            "application",
            "eligibility",
            "entrance",
            "admissions",
        ],
        "response": (
            "Admission process usually has 4 steps: registration, document upload, "
            "eligibility check, and fee payment after confirmation. Keep your 10th, "
            "12th, ID proof, and transfer documents ready."
        ),
    },
    "fees": {
        "keywords": [
            "fee",
            "fees",
            "tuition",
            "cost",
            "semester fee",
            "hostel fee",
        ],
        "response": (
            "Sample fee structure for demo: B.Tech Rs 1.5 lakh/year, BCA Rs 80,000/year, "
            "MBA Rs 2 lakh/year, hostel Rs 60,000/year with mess. Please replace these "
            "values with your college's actual numbers before submission."
        ),
    },
    "courses": {
        "keywords": [
            "course",
            "courses",
            "program",
            "programs",
            "degree",
            "branch",
        ],
        "response": (
            "Sample courses supported by this bot: B.Tech (CSE, IT, ECE, Mechanical, Civil), "
            "BCA, BBA, MBA, MCA, and B.Sc programs. You can customize the list in the backend FAQ."
        ),
    },
    "placement": {
        "keywords": [
            "placement",
            "package",
            "recruiter",
            "job",
            "company",
            "internship",
        ],
        "response": (
            "Placement response for demo: around 80 to 85 percent students placed, "
            "average package 5 to 6 LPA, with recruiters like TCS, Infosys, Wipro, and Accenture."
        ),
    },
    "scholarship": {
        "keywords": [
            "scholarship",
            "waiver",
            "financial aid",
            "concession",
        ],
        "response": (
            "Scholarship support can include merit scholarships, category-based aid, and "
            "fee waivers for high scorers. You can add exact eligibility rules in the FAQ service."
        ),
    },
    "hostel": {
        "keywords": [
            "hostel",
            "accommodation",
            "mess",
            "room",
            "residence",
        ],
        "response": (
            "Hostel information for demo: separate hostels for boys and girls, Wi-Fi, mess, "
            "security, common room, and transport support. Annual hostel plus mess fee can be customized."
        ),
    },
    "library": {
        "keywords": [
            "library",
            "books",
            "journal",
            "reading room",
            "digital library",
        ],
        "response": (
            "Library demo response: central library with books, journals, digital resources, "
            "and study area. Typical timing can be 8 AM to 8 PM."
        ),
    },
    "contact": {
        "keywords": [
            "contact",
            "phone",
            "email",
            "office",
            "helpdesk",
        ],
        "response": (
            "You can add your college's admission cell phone number, email, and office hours "
            "here so students get direct contact information."
        ),
    },
}

DEFAULT_RESPONSE = (
    "Main admissions, fees, courses, placements, hostel, scholarship, library, aur contact "
    "details mein help kar sakta hoon. Aap apna question thoda specific poochho."
)


def find_faq_response(message: str) -> Optional[Dict[str, str]]:
    lowered = message.lower()
    best_match = None
    best_score = 0

    for topic, entry in FAQ_RESPONSES.items():
        score = sum(1 for keyword in entry["keywords"] if keyword in lowered)
        if score > best_score:
            best_score = score
            best_match = {
                "response": entry["response"],
                "source": f"faq:{topic}",
            }

    return best_match if best_score > 0 else None
