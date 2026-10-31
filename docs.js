// SAMPLE DATA ONLY. "DemoPrep Academy" is a FICTIONAL institute created for this demo.
// None of these fees, timings, names, phone numbers or policies are real.
const DOCS = [
  { file: "fees_2026-27.md", title: "Fee Structure 2026-27 (sample)", sections: [
    { h: "JEE Main + Advanced (2-year classroom)", t: "The two-year JEE Main and Advanced classroom programme costs Rs 1,45,000 per year including GST. Fees can be paid in 3 instalments: 40% at admission, 30% by 15 August and 30% by 15 November. Study material and test series are included in the fee." },
    { h: "NEET (2-year classroom)", t: "The two-year NEET classroom programme costs Rs 1,35,000 per year including GST. It can be paid in 3 instalments, same schedule as JEE. Biology lab sessions and the weekly NEET mock test series are included." },
    { h: "EAPCET crash course", t: "The EAPCET (EAMCET) crash course runs for 10 weeks from February to April and costs Rs 28,000 including GST, payable in full at admission." },
    { h: "Scholarships and discounts", t: "Students scoring above 90% in the DemoPrep Scholarship Test (DAST) get up to 50% off tuition. Siblings get a 10% discount. Scholarships and sibling discounts cannot be combined. DAST is held every Sunday at 10 AM and is free to attempt." },
    { h: "Refund policy", t: "Fees are refundable minus Rs 10,000 processing charge if you withdraw within 15 days of the batch start date. After 15 days no refund is given, but the seat can be transferred to a later batch once." },
    { h: "Payment methods", t: "We accept UPI, debit and credit cards, net banking and demand drafts. Education loan (EMI) options are available through partner banks with 0% interest for 6 months." }
  ]},
  { file: "timings_and_batches.md", title: "Timings & Batches (sample)", sections: [
    { h: "Weekday batches", t: "Morning batch runs 7:00 AM to 10:00 AM, Monday to Saturday, for students in integrated junior colleges. Evening batch runs 4:30 PM to 8:00 PM, Monday to Saturday, for school students." },
    { h: "Weekend batch", t: "The weekend batch runs on Saturday and Sunday from 9:00 AM to 4:00 PM, with a one-hour lunch break, and is meant for repeaters and droppers." },
    { h: "Office hours", t: "The front office is open 9:00 AM to 7:00 PM, Monday to Saturday. It is closed on Sundays except on DAST scholarship test days, when it opens from 9:00 AM to 1:00 PM." },
    { h: "New batch start dates", t: "New JEE and NEET batches for the 2026-27 session start on 6 April 2026 and 15 June 2026. A late-joiner batch starts on 1 August 2026 with extra catch-up classes." },
    { h: "Batch size", t: "Each classroom batch has a maximum of 40 students so that faculty can give individual attention." }
  ]},
  { file: "admissions_faq.md", title: "Admissions FAQ (sample)", sections: [
    { h: "How to take admission", t: "Visit the centre or apply online, attempt the free DAST scholarship test, then complete admission by paying the first instalment. Bring 2 passport photos, a copy of the latest marks memo and an Aadhaar copy of the student." },
    { h: "Free demo classes", t: "Yes, you can attend 2 free demo classes before taking admission. Book a demo slot at the front office or on WhatsApp." },
    { h: "Online classes", t: "Live online classes are available for all programmes at 20% lower fees than classroom. Recordings are available for 7 days after each live class." },
    { h: "Hostel and transport", t: "We do not run our own hostel, but we share a list of verified hostels near the centre. Bus transport is available from Kukatpally, Dilsukhnagar and Secunderabad for Rs 2,500 per month." },
    { h: "Parent updates", t: "Parents receive weekly test scores and attendance reports on WhatsApp, and parent-teacher meetings are held once a month on the second Saturday." }
  ]},
  { file: "about_and_contact.md", title: "About & Contact (sample)", sections: [
    { h: "Location", t: "DemoPrep Academy (fictional) is located in Ameerpet, Hyderabad, a 3-minute walk from the Ameerpet metro station. This is a demo address, not a real place." },
    { h: "Faculty", t: "Our faculty team has 12 teachers, each with at least 8 years of JEE and NEET teaching experience. (Sample data for demo purposes.)" },
    { h: "Contact", t: "This is a demo. For real enquiries the chatbot would hand over to the institute's front desk by phone or WhatsApp during office hours." }
  ]}
];
if (typeof module !== "undefined") module.exports = { DOCS };
