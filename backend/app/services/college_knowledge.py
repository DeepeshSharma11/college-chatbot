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
            "![Campus View](/images/campus.png)\n\n"
            "**Welcome to our prestigious university!** The admission process consists of 4 streamlined steps:\n"
            "1. **Online Registration**\n"
            "2. **Document Upload** (10th, 12th, ID proof, and transfer documents)\n"
            "3. **Eligibility Verification**\n"
            "4. **Fee Payment & Confirmation**\n\n"
            "Our world-class campus awaits you!"
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
            "![Campus View](/images/campus.png)\n\n"
            "**Academic Programs**\n\n"
            "We offer a wide array of industry-aligned programs designed to prepare you for the future:\n"
            "- **B.Tech** (CSE, IT, ECE, Mechanical, Civil)\n"
            "- **Management**: BBA, MBA\n"
            "- **Computer Applications**: BCA, MCA\n"
            "- **Sciences**: B.Sc Programs\n\n"
            "All our courses feature state-of-the-art curriculum and world-class faculty."
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
            "![Modern Hostel](/images/hostel.png)\n\n"
            "**Premium Hostel Facilities**\n\n"
            "Experience a home away from home with our ultra-modern hostels:\n"
            "- Separate, secure blocks for boys and girls.\n"
            "- High-speed Wi-Fi, 24/7 security, and power backup.\n"
            "- Spacious common rooms and recreational areas.\n"
            "- Nutritious and hygienic mess facilities included."
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
            "![University Library](/images/library.png)\n\n"
            "**The Central Library**\n\n"
            "Our massive, high-tech central library is the heart of academic life on campus:\n"
            "- Over 100,000 physical books and millions of digital journals.\n"
            "- Comfortable, quiet reading rooms with natural lighting.\n"
            "- Open 8 AM to 10 PM daily for your convenience."
        ),
    },
    "cafeteria": {
        "keywords": [
            "cafeteria",
            "canteen",
            "food",
            "mess",
            "eat",
            "dining"
        ],
        "response": (
            "![Campus Cafeteria](/images/cafeteria.png)\n\n"
            "**Vibrant Cafeteria & Dining**\n\n"
            "Our modern campus cafeteria offers a wide variety of delicious, hygienic, and affordable meals:\n"
            "- Multi-cuisine food stations serving healthy options.\n"
            "- Spacious, aesthetic seating areas filled with natural light.\n"
            "- The perfect spot to relax and socialize between classes."
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
