"""Seed script to populate database with initial data."""
import logging
import sys

from sqlalchemy.orm import Session

from app.auth.jwt import hash_password
from app.database import SessionLocal
from app.models.product import ProductTemplate, ProductType
from app.models.subscription import Plan, PlanTier
from app.models.tenant import FranchiseTier, Tenant
from app.models.user import User, UserRole

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_super_admin(db: Session) -> User:
    existing = db.query(User).filter(User.email == "admin@nexastack.com").first()
    if existing:
        if existing.role != UserRole.super_admin:
            existing.role = UserRole.super_admin
            db.commit()
        return existing

    user = User(
        email="admin@nexastack.com",
        hashed_password=hash_password("Admin@123"),
        full_name="Super Admin",
        role=UserRole.super_admin,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def seed_franchise(db: Session, admin: User) -> Tenant:
    existing = db.query(Tenant).filter(Tenant.slug == "demo-franchise").first()
    if existing:
        return existing

    owner = User(
        email="franchise@nexastack.com",
        hashed_password=hash_password("Franchise@123"),
        full_name="Demo Franchise Owner",
        role=UserRole.franchise_owner,
        is_active=True,
        is_verified=True,
    )
    db.add(owner)
    db.flush()

    tenant = Tenant(
        name="Demo Digital Agency",
        slug="demo-franchise",
        subdomain="demo",
        brand_color_primary="#E85D04",
        brand_color_secondary="#1A1A2E",
        owner_id=owner.id,
        tier=FranchiseTier.gold,
        is_active=True,
        onboarding_fee_paid=True,
    )
    db.add(tenant)
    db.flush()

    owner.tenant_id = tenant.id
    db.commit()
    db.refresh(tenant)
    return tenant


def seed_customers(db: Session, tenant: Tenant) -> list[User]:
    customers = []
    customer_data = [
        ("customer1@example.com", "Raj Kumar", "9876543210"),
        ("customer2@example.com", "Priya Sharma", "9876543211"),
        ("customer3@example.com", "Anand Patel", "9876543212"),
    ]
    for email, name, phone in customer_data:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            customers.append(existing)
            continue
        user = User(
            email=email,
            hashed_password=hash_password("Customer@123"),
            full_name=name,
            phone=phone,
            role=UserRole.customer,
            tenant_id=tenant.id,
            is_active=True,
        )
        db.add(user)
        customers.append(user)

    db.commit()
    logger.info("Created %d demo customers", len(customers))
    return customers


def seed_plans(db: Session) -> list[Plan]:
    existing = db.query(Plan).count()
    if existing > 0:
        return db.query(Plan).all()

    plans_data = [
        ("vCard Starter", "vcard", PlanTier.starter, 499, "yearly", {"cards": 1, "analytics": True, "qr_code": True}),
        ("vCard Pro", "vcard", PlanTier.pro, 999, "yearly", {"cards": 3, "analytics": True, "qr_code": True, "custom_domain": True}),
        ("vCard Business", "vcard", PlanTier.business, 2499, "yearly", {"cards": 10, "analytics": True, "qr_code": True, "custom_domain": True, "nfc": True}),
        ("Website Starter", "website", PlanTier.starter, 1999, "yearly", {"sites": 1, "ai_content": True, "seo": True}),
        ("Website Pro", "website", PlanTier.pro, 4999, "yearly", {"sites": 3, "ai_content": True, "seo": True, "custom_domain": True}),
        ("Website Agency", "website", PlanTier.enterprise, 14999, "yearly", {"sites": 20, "ai_content": True, "seo": True, "custom_domain": True, "priority_support": True}),
        ("Reviews Starter", "google_reviews", PlanTier.starter, 499, "monthly", {"qr_system": True, "ai_replies": 10}),
        ("Reviews Pro", "google_reviews", PlanTier.pro, 999, "monthly", {"qr_system": True, "ai_replies": 50, "gmb_posting": True}),
        ("Menu Basic", "qr_menu", PlanTier.starter, 299, "monthly", {"items": 100, "categories": 10}),
        ("Menu Pro", "qr_menu", PlanTier.pro, 799, "monthly", {"items": 500, "categories": 50, "ordering": True}),
        ("Poster Starter", "social_poster", PlanTier.starter, 199, "monthly", {"templates": 50, "ai_captions": True}),
        ("Poster Pro", "social_poster", PlanTier.pro, 499, "monthly", {"templates": 500, "ai_captions": True, "scheduler": True}),
        ("Bio Basic", "link_in_bio", PlanTier.starter, 299, "yearly", {"links": 20, "analytics": True}),
        ("Bio Pro", "link_in_bio", PlanTier.pro, 699, "yearly", {"links": 100, "analytics": True, "custom_domain": True}),
        ("Chatbot Basic", "whatsapp_chatbot", PlanTier.starter, 599, "monthly", {"flows": 5, "auto_replies": True}),
        ("Chatbot Pro", "whatsapp_chatbot", PlanTier.pro, 1299, "monthly", {"flows": 20, "auto_replies": True, "ai_smart_reply": True, "crm": True}),
    ]

    plans = []
    for name, ptype, tier, price, cycle, features in plans_data:
        plan = Plan(name=name, product_type=ptype, tier=tier, price_amount=price, price_currency="INR", billing_cycle=cycle, features=features)
        db.add(plan)
        plans.append(plan)
    db.commit()
    logger.info("Created %d subscription plans", len(plans))
    return plans


def seed_templates(db: Session) -> list[ProductTemplate]:
    existing = db.query(ProductTemplate).count()
    if existing > 0:
        return db.query(ProductTemplate).all()

    templates_data = [
        # ===== vCard Templates (12) =====
        (ProductType.vcard, "Professional Classic", "Clean corporate design", "Corporate", "classic", False, {
            "full_name": "Arjun Mehta", "designation": "Senior Manager", "company": "TechVista Solutions",
            "phone": "+91 98765 43210", "whatsapp": "+919876543210", "email": "arjun@techvista.com",
            "website": "https://techvista.com", "address": "MG Road, Bengaluru, Karnataka",
            "services": ["IT Consulting", "Cloud Solutions", "Digital Transformation", "Cybersecurity"],
            "business_hours": "Mon-Fri: 9AM-6PM", "facebook": "https://facebook.com/techvista",
            "linkedin": "https://linkedin.com/in/arjunmehta",
            "theme_primary": "#003049", "theme_secondary": "#669BBC", "theme_bg": "#FFFFFF", "theme_text": "#1A1A2E",
        }),
        (ProductType.vcard, "Doctor Premium", "Medical professional card", "Healthcare", "modern", False, {
            "full_name": "Dr. Sneha Reddy", "designation": "Cardiologist", "company": "Apollo Heart Centre",
            "phone": "+91 98765 11111", "email": "dr.sneha@apolloheart.com",
            "services": ["Heart Checkup", "ECG", "Echocardiography", "Angioplasty Consultation"],
            "business_hours": "Mon-Sat: 10AM-5PM", "address": "Jubilee Hills, Hyderabad",
            "theme_primary": "#0D9488", "theme_secondary": "#5EEAD4", "theme_bg": "#FFFFFF", "theme_text": "#134E4A",
        }),
        (ProductType.vcard, "Real Estate Agent", "Property listing card", "Real Estate", "elegant", False, {
            "full_name": "Vikram Singh", "designation": "Senior Property Consultant", "company": "HomeFinders Realty",
            "phone": "+91 99887 65432", "whatsapp": "+919988765432", "email": "vikram@homefinders.in",
            "services": ["Residential Sales", "Commercial Leasing", "Property Valuation", "Investment Advisory"],
            "business_hours": "Mon-Sun: 9AM-8PM", "address": "DLF Phase 5, Gurgaon",
            "theme_primary": "#92400E", "theme_secondary": "#D97706", "theme_bg": "#FFFBEB", "theme_text": "#1C1917",
        }),
        (ProductType.vcard, "Restaurant Owner", "Food business card", "Restaurant", "vibrant", False, {
            "full_name": "Chef Ramesh Iyer", "designation": "Owner & Head Chef", "company": "Spice Garden Restaurant",
            "phone": "+91 98765 22222", "email": "info@spicegarden.in",
            "services": ["South Indian Cuisine", "North Indian Thali", "Catering Services", "Party Orders"],
            "business_hours": "Daily: 11AM-11PM", "address": "Anna Nagar, Chennai",
            "theme_primary": "#DC2626", "theme_secondary": "#FB923C", "theme_bg": "#FFF7ED", "theme_text": "#1C1917",
        }),
        (ProductType.vcard, "Salon & Spa", "Beauty business card", "Beauty", "elegant", True, {
            "full_name": "Meera Kapoor", "designation": "Founder & Stylist", "company": "Glow Beauty Lounge",
            "phone": "+91 98765 33333", "email": "meera@glowbeauty.com",
            "services": ["Hair Styling", "Skin Care", "Bridal Makeup", "Spa Treatments", "Nail Art"],
            "business_hours": "Tue-Sun: 10AM-8PM", "instagram": "https://instagram.com/glowbeauty",
            "theme_primary": "#BE185D", "theme_secondary": "#EC4899", "theme_bg": "#FFF1F2", "theme_text": "#1C1917",
        }),
        (ProductType.vcard, "Lawyer Professional", "Legal professional card", "Legal", "classic", False, {
            "full_name": "Adv. Karthik Nair", "designation": "Senior Advocate", "company": "Nair & Associates",
            "phone": "+91 98765 44444", "email": "karthik@nairlegal.com",
            "services": ["Corporate Law", "Property Disputes", "Criminal Defense", "Family Law"],
            "business_hours": "Mon-Sat: 10AM-6PM", "address": "MG Road, Kochi, Kerala",
            "theme_primary": "#1E3A5F", "theme_secondary": "#3B82F6", "theme_bg": "#FFFFFF", "theme_text": "#0F172A",
        }),
        (ProductType.vcard, "Freelance Designer", "Creative portfolio card", "Design", "modern", False, {
            "full_name": "Aisha Khan", "designation": "UI/UX Designer", "company": "Freelance",
            "phone": "+91 98765 55555", "email": "aisha@design.studio",
            "website": "https://aisha.design", "instagram": "https://instagram.com/aishadesigns",
            "services": ["UI/UX Design", "Brand Identity", "Web Design", "Mobile App Design", "Illustration"],
            "theme_primary": "#7C3AED", "theme_secondary": "#A78BFA", "theme_bg": "#FAF5FF", "theme_text": "#1E1B4B",
        }),
        (ProductType.vcard, "Fitness Trainer", "Personal trainer card", "Fitness", "vibrant", False, {
            "full_name": "Ravi Sharma", "designation": "Certified Personal Trainer", "company": "FitLife Studio",
            "phone": "+91 98765 66666", "whatsapp": "+919876566666", "email": "ravi@fitlife.in",
            "services": ["Personal Training", "Weight Loss", "Muscle Building", "Yoga", "Diet Planning"],
            "business_hours": "Mon-Sat: 6AM-9PM", "instagram": "https://instagram.com/ravifitlife",
            "theme_primary": "#059669", "theme_secondary": "#34D399", "theme_bg": "#ECFDF5", "theme_text": "#064E3B",
        }),
        (ProductType.vcard, "Chartered Accountant", "CA professional card", "Finance", "classic", False, {
            "full_name": "Deepak Gupta", "designation": "Chartered Accountant", "company": "Gupta & Co. CA",
            "phone": "+91 98765 77777", "email": "deepak@guptaca.com",
            "services": ["Tax Filing", "GST Returns", "Company Registration", "Audit Services", "Financial Planning"],
            "business_hours": "Mon-Sat: 10AM-7PM", "address": "Connaught Place, New Delhi",
            "theme_primary": "#1E40AF", "theme_secondary": "#60A5FA", "theme_bg": "#FFFFFF", "theme_text": "#0F172A",
        }),
        (ProductType.vcard, "Wedding Photographer", "Photography card", "Photography", "elegant", True, {
            "full_name": "Nisha Verma", "designation": "Lead Photographer", "company": "Moments by Nisha",
            "phone": "+91 98765 88888", "email": "nisha@momentsbynisha.com",
            "instagram": "https://instagram.com/momentsbynisha", "youtube": "https://youtube.com/@momentsbynisha",
            "services": ["Wedding Photography", "Pre-Wedding Shoots", "Candid Photography", "Albums", "Videography"],
            "theme_primary": "#9D174D", "theme_secondary": "#F472B6", "theme_bg": "#FDF2F8", "theme_text": "#1C1917",
        }),
        (ProductType.vcard, "Architect", "Modern architect card", "Architecture", "modern", False, {
            "full_name": "Sanjay Deshmukh", "designation": "Principal Architect", "company": "DesignSpace Architects",
            "phone": "+91 98765 99999", "email": "sanjay@designspace.in", "website": "https://designspace.in",
            "services": ["Residential Design", "Commercial Projects", "Interior Design", "3D Visualization", "Green Building"],
            "business_hours": "Mon-Fri: 10AM-7PM", "address": "Koregaon Park, Pune",
            "theme_primary": "#0F766E", "theme_secondary": "#2DD4BF", "theme_bg": "#F0FDFA", "theme_text": "#134E4A",
        }),
        (ProductType.vcard, "Dentist", "Dental clinic card", "Healthcare", "modern", False, {
            "full_name": "Dr. Priya Menon", "designation": "Cosmetic Dentist", "company": "SmileCare Dental Clinic",
            "phone": "+91 98765 10101", "email": "priya@smilecare.in",
            "services": ["Teeth Whitening", "Root Canal", "Dental Implants", "Braces", "Smile Makeover"],
            "business_hours": "Mon-Sat: 9AM-7PM", "address": "Indiranagar, Bengaluru",
            "theme_primary": "#0284C7", "theme_secondary": "#38BDF8", "theme_bg": "#F0F9FF", "theme_text": "#0C4A6E",
        }),

        # ===== Website Templates (8) =====
        (ProductType.website, "Business Starter", "Modern business landing page", "General", "modern", False, {
            "business_name": "TechVista Solutions", "tagline": "Innovation meets excellence",
            "about": "We are a leading technology consulting firm helping businesses transform digitally since 2015.",
            "phone": "+91 98765 43210", "email": "hello@techvista.com", "cta_text": "Get Free Consultation",
            "services": [{"name": "Cloud Solutions", "description": "Migrate to the cloud seamlessly", "icon": "☁️"},
                         {"name": "Cybersecurity", "description": "Protect your digital assets", "icon": "🔒"},
                         {"name": "AI & ML", "description": "Intelligent automation solutions", "icon": "🤖"}],
            "testimonials": [{"name": "Rahul M.", "text": "TechVista transformed our entire IT infrastructure.", "rating": 5},
                             {"name": "Anita S.", "text": "Professional team with excellent delivery.", "rating": 5}],
            "faq": [{"question": "What industries do you serve?", "answer": "We serve healthcare, finance, retail, and manufacturing."},
                    {"question": "Do you offer support?", "answer": "Yes, 24/7 support is included in all plans."}],
            "theme_primary": "#0077B6", "theme_secondary": "#00B4D8", "theme_bg": "#FFFFFF", "theme_text": "#03045E",
        }),
        (ProductType.website, "Restaurant Starter", "Restaurant site with menu", "Restaurant", "vibrant", False, {
            "business_name": "Spice Garden", "tagline": "Authentic flavors, unforgettable experiences",
            "about": "Family-owned restaurant serving traditional Indian cuisine for over 20 years.",
            "phone": "+91 98765 22222", "whatsapp": "+919876522222", "email": "eat@spicegarden.in",
            "cta_text": "Reserve a Table",
            "services": [{"name": "Dine-In", "description": "Premium dining experience", "icon": "🍽️"},
                         {"name": "Catering", "description": "Events & party orders", "icon": "🎉"},
                         {"name": "Delivery", "description": "Hot food at your door", "icon": "🛵"}],
            "testimonials": [{"name": "Priya K.", "text": "Best biryani in the city!", "rating": 5},
                             {"name": "Arun D.", "text": "Amazing ambiance and food quality.", "rating": 5}],
            "theme_primary": "#DC2626", "theme_secondary": "#FB923C", "theme_bg": "#FFFFFF", "theme_text": "#1C1917",
        }),
        (ProductType.website, "Salon Website", "Beauty salon website", "Beauty", "elegant", True, {
            "business_name": "Glow Beauty Lounge", "tagline": "Where beauty meets luxury",
            "about": "Premium salon offering world-class beauty treatments and spa services.",
            "phone": "+91 98765 33333", "email": "book@glowbeauty.com", "cta_text": "Book Appointment",
            "services": [{"name": "Hair Styling", "description": "Cuts, color, and treatments", "icon": "💇"},
                         {"name": "Skin Care", "description": "Facials and skin therapy", "icon": "✨"},
                         {"name": "Bridal Package", "description": "Complete wedding look", "icon": "👰"}],
            "theme_primary": "#BE185D", "theme_secondary": "#EC4899", "theme_bg": "#FFFFFF", "theme_text": "#1C1917",
        }),
        (ProductType.website, "Gym & Fitness", "Energetic fitness studio site", "Fitness", "vibrant", False, {
            "business_name": "FitLife Studio", "tagline": "Train hard, live strong",
            "about": "State-of-the-art fitness center with certified trainers and modern equipment.",
            "phone": "+91 98765 66666", "email": "join@fitlife.in", "cta_text": "Start Free Trial",
            "services": [{"name": "Personal Training", "description": "1-on-1 expert coaching", "icon": "💪"},
                         {"name": "Group Classes", "description": "Yoga, Zumba, CrossFit", "icon": "🧘"},
                         {"name": "Nutrition", "description": "Custom diet plans", "icon": "🥗"}],
            "testimonials": [{"name": "Vikram S.", "text": "Lost 15kg in 3 months! Amazing trainers.", "rating": 5}],
            "theme_primary": "#059669", "theme_secondary": "#34D399", "theme_bg": "#FFFFFF", "theme_text": "#064E3B",
        }),
        (ProductType.website, "Dental Clinic", "Professional dental site", "Healthcare", "modern", False, {
            "business_name": "SmileCare Dental", "tagline": "Your smile, our passion",
            "about": "Advanced dental clinic with painless treatments and the latest technology.",
            "phone": "+91 98765 10101", "email": "smile@smilecare.in", "cta_text": "Book Consultation",
            "services": [{"name": "Teeth Whitening", "description": "Bright smile in one session", "icon": "😁"},
                         {"name": "Dental Implants", "description": "Permanent tooth replacement", "icon": "🦷"},
                         {"name": "Orthodontics", "description": "Braces and aligners", "icon": "✨"}],
            "faq": [{"question": "Is teeth whitening safe?", "answer": "Yes, we use FDA-approved products."},
                    {"question": "Do you accept insurance?", "answer": "Yes, all major insurance providers accepted."}],
            "theme_primary": "#0284C7", "theme_secondary": "#38BDF8", "theme_bg": "#FFFFFF", "theme_text": "#0C4A6E",
        }),
        (ProductType.website, "Photography Portfolio", "Visual portfolio site", "Photography", "elegant", True, {
            "business_name": "Moments by Nisha", "tagline": "Capturing life's beautiful moments",
            "about": "Award-winning wedding and portrait photographer based in Mumbai.",
            "phone": "+91 98765 88888", "email": "nisha@momentsbynisha.com", "cta_text": "View Portfolio",
            "services": [{"name": "Wedding", "description": "Complete wedding coverage", "icon": "💍"},
                         {"name": "Portraits", "description": "Studio and outdoor", "icon": "📸"},
                         {"name": "Events", "description": "Corporate and celebrations", "icon": "🎉"}],
            "theme_primary": "#9D174D", "theme_secondary": "#F472B6", "theme_bg": "#FFFFFF", "theme_text": "#1C1917",
        }),
        (ProductType.website, "Coaching Academy", "Education & courses site", "Education", "modern", False, {
            "business_name": "BrightMinds Academy", "tagline": "Unlock your potential",
            "about": "Premier coaching institute for competitive exams with 95% success rate.",
            "phone": "+91 98765 12121", "email": "info@brightminds.edu", "cta_text": "Enroll Now",
            "services": [{"name": "IIT-JEE", "description": "Complete preparation", "icon": "🎯"},
                         {"name": "NEET", "description": "Medical entrance coaching", "icon": "⚕️"},
                         {"name": "Foundations", "description": "Class 8-10 programs", "icon": "📚"}],
            "testimonials": [{"name": "Rohit A.", "text": "Got AIR 450 in JEE! Thank you BrightMinds!", "rating": 5}],
            "theme_primary": "#7C3AED", "theme_secondary": "#A78BFA", "theme_bg": "#FFFFFF", "theme_text": "#1E1B4B",
        }),
        (ProductType.website, "Law Firm", "Professional law firm site", "Legal", "classic", False, {
            "business_name": "Nair & Associates", "tagline": "Justice with integrity",
            "about": "Full-service law firm with 25+ years of experience across all major practice areas.",
            "phone": "+91 98765 44444", "email": "contact@nairlegal.com", "cta_text": "Free Consultation",
            "services": [{"name": "Corporate Law", "description": "M&A, compliance, contracts", "icon": "🏢"},
                         {"name": "Litigation", "description": "Civil and criminal cases", "icon": "⚖️"},
                         {"name": "Property Law", "description": "Real estate transactions", "icon": "🏠"}],
            "theme_primary": "#1E3A5F", "theme_secondary": "#3B82F6", "theme_bg": "#FFFFFF", "theme_text": "#0F172A",
        }),

        # ===== QR Menu Templates (6) =====
        (ProductType.qr_menu, "Classic Restaurant", "Traditional menu layout", "Restaurant", "classic", False, {
            "restaurant_name": "Spice Garden", "tagline": "Authentic Indian Cuisine",
            "currency": "₹", "layout": "list", "show_images": True,
            "categories": [
                {"id": "c1", "name": "Starters", "items": [
                    {"id": "i1", "name": "Paneer Tikka", "description": "Marinated cottage cheese grilled to perfection", "price": 249, "is_veg": True, "is_bestseller": True, "is_available": True},
                    {"id": "i2", "name": "Chicken 65", "description": "Spicy deep-fried chicken", "price": 299, "is_veg": False, "is_spicy": True, "is_available": True},
                    {"id": "i3", "name": "Veg Spring Rolls", "description": "Crispy rolls with mixed vegetables", "price": 179, "is_veg": True, "is_available": True},
                ]},
                {"id": "c2", "name": "Main Course", "items": [
                    {"id": "i4", "name": "Butter Chicken", "description": "Creamy tomato-based curry", "price": 349, "is_veg": False, "is_bestseller": True, "is_available": True},
                    {"id": "i5", "name": "Dal Makhani", "description": "Slow-cooked black lentils in butter", "price": 249, "is_veg": True, "is_available": True},
                    {"id": "i6", "name": "Paneer Butter Masala", "description": "Rich paneer in tomato gravy", "price": 279, "is_veg": True, "is_available": True},
                ]},
                {"id": "c3", "name": "Beverages", "items": [
                    {"id": "i7", "name": "Mango Lassi", "description": "Sweet yogurt drink", "price": 99, "is_veg": True, "is_available": True},
                    {"id": "i8", "name": "Masala Chai", "description": "Spiced Indian tea", "price": 49, "is_veg": True, "is_available": True},
                ]},
            ],
            "theme_primary": "#DC2626", "theme_bg": "#FFF7ED", "theme_text": "#1C1917",
        }),
        (ProductType.qr_menu, "Cafe Menu", "Modern cafe menu", "Cafe", "modern", False, {
            "restaurant_name": "Brew & Bite Cafe", "tagline": "Coffee, Food & Good Vibes",
            "currency": "₹", "layout": "grid", "show_images": True,
            "categories": [
                {"id": "c1", "name": "Coffee", "items": [
                    {"id": "i1", "name": "Cappuccino", "description": "Classic Italian coffee", "price": 149, "is_veg": True, "is_bestseller": True, "is_available": True},
                    {"id": "i2", "name": "Cold Brew", "description": "Slow-steeped for 12 hours", "price": 179, "is_veg": True, "is_available": True},
                ]},
                {"id": "c2", "name": "Snacks", "items": [
                    {"id": "i3", "name": "Avocado Toast", "description": "Sourdough with fresh avocado", "price": 249, "is_veg": True, "is_bestseller": True, "is_available": True},
                    {"id": "i4", "name": "Chicken Wrap", "description": "Grilled chicken in tortilla", "price": 279, "is_veg": False, "is_available": True},
                ]},
            ],
            "theme_primary": "#92400E", "theme_bg": "#FFFBEB", "theme_text": "#1C1917",
        }),
        (ProductType.qr_menu, "Fine Dining", "Premium restaurant menu", "Fine Dining", "elegant", True, {
            "restaurant_name": "Le Jardin", "tagline": "A culinary journey",
            "currency": "₹", "layout": "list", "show_images": True,
            "categories": [
                {"id": "c1", "name": "Amuse-Bouche", "items": [
                    {"id": "i1", "name": "Truffle Mushroom Soup", "description": "Wild mushroom velouté with truffle oil", "price": 450, "is_veg": True, "is_bestseller": True, "is_available": True},
                ]},
                {"id": "c2", "name": "Entrées", "items": [
                    {"id": "i2", "name": "Pan-Seared Sea Bass", "description": "With saffron risotto and asparagus", "price": 1250, "is_veg": False, "is_bestseller": True, "is_available": True},
                    {"id": "i3", "name": "Lamb Shank", "description": "Slow-braised with red wine reduction", "price": 1450, "is_veg": False, "is_available": True},
                ]},
            ],
            "theme_primary": "#1E1B4B", "theme_bg": "#FAFAFA", "theme_text": "#0F0D1A",
        }),
        (ProductType.qr_menu, "Street Food Truck", "Casual food truck menu", "Street Food", "vibrant", False, {
            "restaurant_name": "Tikka Express", "tagline": "Street food, big flavors!",
            "currency": "₹", "layout": "grid", "show_images": True,
            "categories": [
                {"id": "c1", "name": "Rolls & Wraps", "items": [
                    {"id": "i1", "name": "Chicken Kathi Roll", "description": "Juicy chicken in flaky paratha", "price": 120, "is_veg": False, "is_bestseller": True, "is_available": True},
                    {"id": "i2", "name": "Paneer Tikka Roll", "description": "Grilled paneer with mint chutney", "price": 99, "is_veg": True, "is_available": True},
                ]},
                {"id": "c2", "name": "Chaats", "items": [
                    {"id": "i3", "name": "Pani Puri", "description": "6 pieces with tangy water", "price": 49, "is_veg": True, "is_bestseller": True, "is_available": True},
                    {"id": "i4", "name": "Dahi Bhalla", "description": "Lentil dumplings in yogurt", "price": 69, "is_veg": True, "is_available": True},
                ]},
            ],
            "theme_primary": "#EA580C", "theme_bg": "#FFF7ED", "theme_text": "#1C1917",
        }),
        (ProductType.qr_menu, "Bakery & Patisserie", "Sweet treats menu", "Bakery", "elegant", False, {
            "restaurant_name": "Sweet Crust Bakery", "tagline": "Freshly baked happiness",
            "currency": "₹", "layout": "grid", "show_images": True,
            "categories": [
                {"id": "c1", "name": "Cakes", "items": [
                    {"id": "i1", "name": "Chocolate Truffle", "description": "Rich Belgian chocolate", "price": 599, "is_veg": True, "is_bestseller": True, "is_available": True},
                    {"id": "i2", "name": "Red Velvet", "description": "Cream cheese frosting", "price": 649, "is_veg": True, "is_available": True},
                ]},
                {"id": "c2", "name": "Pastries", "items": [
                    {"id": "i3", "name": "Croissant", "description": "Buttery French classic", "price": 89, "is_veg": True, "is_available": True},
                    {"id": "i4", "name": "Blueberry Muffin", "description": "Loaded with fresh blueberries", "price": 79, "is_veg": True, "is_bestseller": True, "is_available": True},
                ]},
                {"id": "c3", "name": "Breads", "items": [
                    {"id": "i5", "name": "Sourdough Loaf", "description": "Artisan fermented bread", "price": 199, "is_veg": True, "is_available": True},
                ]},
            ],
            "theme_primary": "#92400E", "theme_bg": "#FFFBEB", "theme_text": "#1C1917",
        }),
        (ProductType.qr_menu, "South Indian Restaurant", "Traditional South Indian", "South Indian", "classic", False, {
            "restaurant_name": "Saravana Bhavan", "tagline": "Taste of South India",
            "currency": "₹", "layout": "list", "show_images": True,
            "categories": [
                {"id": "c1", "name": "Dosas", "items": [
                    {"id": "i1", "name": "Masala Dosa", "description": "Crispy crepe with potato filling", "price": 89, "is_veg": True, "is_bestseller": True, "is_available": True},
                    {"id": "i2", "name": "Rava Dosa", "description": "Semolina crispy dosa", "price": 99, "is_veg": True, "is_available": True},
                    {"id": "i3", "name": "Ghee Roast", "description": "Crispy dosa with ghee", "price": 109, "is_veg": True, "is_available": True},
                ]},
                {"id": "c2", "name": "Idli & Vada", "items": [
                    {"id": "i4", "name": "Idli (3 pcs)", "description": "Steamed rice cakes with sambar", "price": 59, "is_veg": True, "is_available": True},
                    {"id": "i5", "name": "Medu Vada", "description": "Crispy lentil donuts", "price": 69, "is_veg": True, "is_bestseller": True, "is_available": True},
                ]},
                {"id": "c3", "name": "Meals", "items": [
                    {"id": "i6", "name": "South Indian Thali", "description": "Full meal with rice, sambar, rasam", "price": 149, "is_veg": True, "is_bestseller": True, "is_available": True},
                ]},
            ],
            "theme_primary": "#B91C1C", "theme_bg": "#FEF2F2", "theme_text": "#1C1917",
        }),

        # ===== Link-in-Bio Templates (6) =====
        (ProductType.link_in_bio, "Minimal Bio", "Clean minimal link page", "General", "minimal", False, {
            "display_name": "Aisha Khan", "bio": "UI/UX Designer | Helping brands look beautiful",
            "layout": "rounded",
            "links": [
                {"id": "l1", "title": "My Portfolio", "url": "https://aisha.design", "icon": "portfolio"},
                {"id": "l2", "title": "Book a Call", "url": "https://calendly.com/aisha", "icon": "booking"},
                {"id": "l3", "title": "Design Course", "url": "https://course.aisha.design", "icon": "website"},
            ],
            "social_instagram": "https://instagram.com/aishadesigns",
            "social_linkedin": "https://linkedin.com/in/aishakhan",
            "theme_primary": "#7C3AED", "theme_bg": "#FAF5FF", "theme_text": "#1E1B4B",
        }),
        (ProductType.link_in_bio, "Creator Bio", "Content creator page", "Creator", "vibrant", False, {
            "display_name": "TechGuru Raj", "bio": "500K+ subscribers | Tech reviews & tutorials",
            "layout": "pill",
            "links": [
                {"id": "l1", "title": "Latest YouTube Video", "url": "https://youtube.com/@techgururaj", "icon": "youtube"},
                {"id": "l2", "title": "Instagram Reels", "url": "https://instagram.com/techgururaj", "icon": "instagram"},
                {"id": "l3", "title": "Join Telegram", "url": "https://t.me/techgururaj", "icon": "website"},
                {"id": "l4", "title": "Amazon Affiliate Store", "url": "https://amazon.in/shop/techgururaj", "icon": "shop"},
            ],
            "social_youtube": "https://youtube.com/@techgururaj",
            "social_instagram": "https://instagram.com/techgururaj",
            "social_twitter": "https://twitter.com/techgururaj",
            "theme_primary": "#DC2626", "theme_bg": "#0F0F0F", "theme_text": "#FFFFFF",
        }),
        (ProductType.link_in_bio, "Real Estate Agent", "Property agent bio page", "Real Estate", "modern", False, {
            "display_name": "Vikram Singh | HomeFinders", "bio": "Senior Property Consultant | 500+ properties sold",
            "layout": "rounded",
            "links": [
                {"id": "l1", "title": "View Properties", "url": "https://homefinders.in", "icon": "website"},
                {"id": "l2", "title": "WhatsApp Me", "url": "https://wa.me/919988765432", "icon": "whatsapp"},
                {"id": "l3", "title": "Schedule Visit", "url": "https://calendly.com/vikram", "icon": "booking"},
                {"id": "l4", "title": "Google Reviews", "url": "https://g.page/homefinders", "icon": "website"},
            ],
            "social_facebook": "https://facebook.com/homefinders",
            "social_instagram": "https://instagram.com/homefinders",
            "theme_primary": "#92400E", "theme_bg": "#FFFBEB", "theme_text": "#1C1917",
        }),
        (ProductType.link_in_bio, "Musician", "Artist streaming page", "Music", "vibrant", True, {
            "display_name": "DJ Arjun", "bio": "Electronic Music Producer | 1M+ streams",
            "layout": "pill",
            "links": [
                {"id": "l1", "title": "Listen on Spotify", "url": "https://spotify.com/artist/djarjun", "icon": "music"},
                {"id": "l2", "title": "Apple Music", "url": "https://music.apple.com/djarjun", "icon": "music"},
                {"id": "l3", "title": "YouTube Music Videos", "url": "https://youtube.com/@djarjun", "icon": "youtube"},
                {"id": "l4", "title": "Merch Store", "url": "https://shop.djarjun.com", "icon": "shop"},
                {"id": "l5", "title": "Book for Events", "url": "https://djarjun.com/book", "icon": "booking"},
            ],
            "social_instagram": "https://instagram.com/djarjun",
            "social_youtube": "https://youtube.com/@djarjun",
            "theme_primary": "#7C3AED", "theme_bg": "#0F0523", "theme_text": "#FFFFFF",
        }),
        (ProductType.link_in_bio, "Fitness Coach", "Health & fitness bio", "Fitness", "modern", False, {
            "display_name": "Coach Ravi | FitLife", "bio": "Certified Trainer | Transform your body in 90 days",
            "layout": "rounded",
            "links": [
                {"id": "l1", "title": "Join 90-Day Program", "url": "https://fitlife.in/program", "icon": "website"},
                {"id": "l2", "title": "Free Workout Videos", "url": "https://youtube.com/@ravifitlife", "icon": "youtube"},
                {"id": "l3", "title": "Book 1-on-1 Session", "url": "https://calendly.com/ravi", "icon": "booking"},
                {"id": "l4", "title": "WhatsApp Community", "url": "https://wa.me/919876566666", "icon": "whatsapp"},
            ],
            "social_instagram": "https://instagram.com/ravifitlife",
            "social_youtube": "https://youtube.com/@ravifitlife",
            "theme_primary": "#059669", "theme_bg": "#ECFDF5", "theme_text": "#064E3B",
        }),
        (ProductType.link_in_bio, "Small Business Owner", "Local business page", "Business", "classic", False, {
            "display_name": "Sweet Crust Bakery", "bio": "Freshly baked happiness since 2010 | Order online",
            "layout": "sharp",
            "links": [
                {"id": "l1", "title": "Order Online", "url": "https://sweetcrust.in/order", "icon": "shop"},
                {"id": "l2", "title": "Today's Menu", "url": "https://sweetcrust.in/menu", "icon": "menu"},
                {"id": "l3", "title": "Google Maps Location", "url": "https://maps.google.com", "icon": "maps"},
                {"id": "l4", "title": "Leave a Review", "url": "https://g.page/sweetcrust", "icon": "website"},
            ],
            "social_instagram": "https://instagram.com/sweetcrustbakery",
            "social_facebook": "https://facebook.com/sweetcrustbakery",
            "theme_primary": "#92400E", "theme_bg": "#FFFBEB", "theme_text": "#1C1917",
        }),

        # ===== Google Reviews Templates (4) =====
        (ProductType.google_reviews, "Restaurant Reviews", "Food service reviews", "Restaurant", "vibrant", False, {
            "business_name": "Spice Garden Restaurant", "tagline": "We'd love to hear about your dining experience!",
            "google_review_url": "https://g.page/r/spicegarden/review", "min_stars_for_google": 4,
            "rating_average": 4.6, "rating_count": 312,
            "sample_reviews": [
                {"name": "Priya K.", "rating": 5, "text": "Best biryani in Chennai! The ambiance is wonderful.", "date": "2026-03-15"},
                {"name": "Arun M.", "rating": 5, "text": "Amazing butter chicken. Will definitely come back!", "date": "2026-03-10"},
                {"name": "Divya R.", "rating": 4, "text": "Great food, service was a bit slow during peak hours.", "date": "2026-03-05"},
            ],
            "thank_you_message": "Thank you for dining with us! Your feedback makes us better.",
            "theme_primary": "#DC2626", "theme_secondary": "#FB923C", "theme_bg": "#FFFFFF", "theme_text": "#1C1917",
        }),
        (ProductType.google_reviews, "Hotel Reviews", "Hospitality reviews", "Hospitality", "elegant", False, {
            "business_name": "Grand Palace Hotel", "tagline": "How was your stay with us?",
            "google_review_url": "https://g.page/r/grandpalace/review", "min_stars_for_google": 4,
            "rating_average": 4.8, "rating_count": 528,
            "sample_reviews": [
                {"name": "Rajesh S.", "rating": 5, "text": "Luxurious stay! Rooms were spotless and staff extremely courteous.", "date": "2026-03-20"},
                {"name": "Sarah L.", "rating": 5, "text": "The spa and pool were incredible. Best hotel in the city.", "date": "2026-03-18"},
            ],
            "theme_primary": "#1E3A5F", "theme_secondary": "#3B82F6", "theme_bg": "#FFFFFF", "theme_text": "#0F172A",
        }),
        (ProductType.google_reviews, "Doctor/Clinic Reviews", "Healthcare reviews", "Healthcare", "modern", False, {
            "business_name": "SmileCare Dental Clinic", "tagline": "Your smile matters to us! Share your experience.",
            "google_review_url": "https://g.page/r/smilecare/review", "min_stars_for_google": 4,
            "rating_average": 4.9, "rating_count": 189,
            "sample_reviews": [
                {"name": "Anita P.", "rating": 5, "text": "Dr. Priya is amazing! Painless root canal treatment.", "date": "2026-03-22"},
                {"name": "Kiran V.", "rating": 5, "text": "Very clean clinic, friendly staff. Highly recommended.", "date": "2026-03-20"},
            ],
            "theme_primary": "#0284C7", "theme_secondary": "#38BDF8", "theme_bg": "#FFFFFF", "theme_text": "#0C4A6E",
        }),
        (ProductType.google_reviews, "Salon Reviews", "Beauty salon reviews", "Beauty", "elegant", True, {
            "business_name": "Glow Beauty Lounge", "tagline": "Loved your look? Tell the world!",
            "google_review_url": "https://g.page/r/glowbeauty/review", "min_stars_for_google": 4,
            "rating_average": 4.7, "rating_count": 245,
            "sample_reviews": [
                {"name": "Sneha G.", "rating": 5, "text": "Best bridal makeup ever! Everyone loved my look.", "date": "2026-03-19"},
                {"name": "Meena T.", "rating": 5, "text": "The hair spa treatment was so relaxing. Love this place!", "date": "2026-03-15"},
            ],
            "theme_primary": "#BE185D", "theme_secondary": "#EC4899", "theme_bg": "#FFFFFF", "theme_text": "#1C1917",
        }),

        # ===== Social Poster Templates (3) =====
        (ProductType.social_poster, "Restaurant Social", "Food marketing posters", "Restaurant", "vibrant", False, {
            "business_name": "Spice Garden Restaurant",
            "categories": ["Festival", "Offer", "Product", "Event"],
            "posters": [
                {"id": "p1", "title": "Holi Special Menu", "caption": "Celebrate the festival of colors with our special thali! 🎨 #HappyHoli #SpiceGarden", "category": "Festival"},
                {"id": "p2", "title": "20% Off Weekday Lunch", "caption": "Enjoy 20% off on all weekday lunches! Limited time offer. 🍛 #LunchDeal", "category": "Offer"},
                {"id": "p3", "title": "New: Butter Chicken Pizza", "caption": "Fusion at its finest! Try our new Butter Chicken Pizza today. 🍕 #NewLaunch", "category": "Product"},
            ],
            "upcoming_events": [
                {"name": "Holi", "date": "2026-03-14", "type": "Festival"},
                {"name": "Good Friday", "date": "2026-04-03", "type": "Holiday"},
            ],
            "total_shared": 156, "total_downloads": 89,
            "theme_primary": "#DC2626", "theme_secondary": "#FB923C", "theme_bg": "#FAFAFA", "theme_text": "#1C1917",
        }),
        (ProductType.social_poster, "Real Estate Social", "Property marketing", "Real Estate", "modern", False, {
            "business_name": "HomeFinders Realty",
            "categories": ["Property", "Offer", "Event", "Tips"],
            "posters": [
                {"id": "p1", "title": "3BHK in DLF Phase 5", "caption": "Luxurious 3BHK apartment available in DLF Phase 5. ₹1.2 Cr onwards. 🏠 #DreamHome", "category": "Property"},
                {"id": "p2", "title": "EMI Starting ₹25K/mo", "caption": "Own your dream home with EMIs starting just ₹25,000/month! 💰 #HomeLoans", "category": "Offer"},
                {"id": "p3", "title": "Open House This Sunday", "caption": "Visit our open house this Sunday! Free property consultation. 🏡 #OpenHouse", "category": "Event"},
            ],
            "total_shared": 78, "total_downloads": 45,
            "theme_primary": "#92400E", "theme_secondary": "#D97706", "theme_bg": "#FAFAFA", "theme_text": "#1C1917",
        }),
        (ProductType.social_poster, "Retail Store Social", "Store marketing", "Retail", "vibrant", False, {
            "business_name": "TrendZ Fashion Store",
            "categories": ["Sale", "NewArrival", "Festival", "Event"],
            "posters": [
                {"id": "p1", "title": "End of Season Sale - 50% Off!", "caption": "Massive end of season sale! Up to 50% off on all brands. 🛍️ #Sale #Fashion", "category": "Sale"},
                {"id": "p2", "title": "Summer Collection 2026", "caption": "Fresh summer styles are here! Check out our new arrivals. ☀️ #SummerVibes", "category": "NewArrival"},
                {"id": "p3", "title": "Diwali Festive Collection", "caption": "Sparkle this Diwali with our festive collection! ✨ #DiwaliReady", "category": "Festival"},
            ],
            "total_shared": 234, "total_downloads": 167,
            "theme_primary": "#EC4899", "theme_secondary": "#F472B6", "theme_bg": "#FAFAFA", "theme_text": "#1C1917",
        }),

        # ===== WhatsApp Chatbot Templates (3) =====
        (ProductType.whatsapp_chatbot, "Restaurant Chatbot", "Restaurant ordering bot", "Restaurant", "modern", False, {
            "business_name": "Spice Garden Restaurant", "whatsapp_number": "+919876522222",
            "welcome_message": "Hello! 👋 Welcome to Spice Garden Restaurant! How can we help you today?",
            "menu_options": [
                {"label": "📋 View Menu", "response": "Here's our menu!\n\n🥗 Starters: Paneer Tikka ₹249, Chicken 65 ₹299\n🍛 Mains: Butter Chicken ₹349, Dal Makhani ₹249\n🍹 Drinks: Mango Lassi ₹99\n\nReply with item name to order!"},
                {"label": "🛵 Place Order", "response": "To place an order, please share:\n1. Your items\n2. Delivery address\n3. Phone number\n\nMinimum order: ₹200"},
                {"label": "📍 Location & Hours", "response": "📍 Anna Nagar, Chennai\n🕐 Open Daily: 11AM-11PM\n📞 Call: +91 98765 22222\n\nGoogle Maps: https://maps.google.com"},
                {"label": "🎉 Party Orders", "response": "We offer catering for parties!\n\n• Min 20 people\n• Customized menu available\n• 10% discount on orders above ₹10,000\n\nCall us to discuss your requirements."},
            ],
            "auto_replies": [
                {"keyword": "menu", "reply": "Here's our menu! Reply 'order' to place one."},
                {"keyword": "hours", "reply": "We're open daily 11AM-11PM!"},
                {"keyword": "delivery", "reply": "We deliver within 5km radius. Min order ₹200."},
            ],
            "business_hours": "Daily: 11AM-11PM",
            "away_message": "We're currently closed. We'll be back at 11AM tomorrow! 🌙",
            "features": ["Auto-Reply", "Menu Display", "Order Taking", "Location Sharing"],
            "theme_primary": "#075E54",
        }),
        (ProductType.whatsapp_chatbot, "E-commerce Support Bot", "Online store support", "E-commerce", "modern", False, {
            "business_name": "TrendZ Fashion Store", "whatsapp_number": "+919876500000",
            "welcome_message": "Hi there! 👋 Welcome to TrendZ Fashion! How can we assist you?",
            "menu_options": [
                {"label": "📦 Track Order", "response": "Please share your order ID (e.g., #TZ12345) and we'll check the status for you right away!"},
                {"label": "↩️ Returns & Exchange", "response": "Our return policy:\n• 7-day easy returns\n• Free exchange on all items\n• Refund within 5 business days\n\nShare your order ID to initiate a return."},
                {"label": "💳 Payment Issues", "response": "For payment issues:\n• Failed payment? Amount will be refunded in 2-3 days\n• Need COD? Available on orders under ₹5,000\n• EMI available on orders above ₹3,000"},
                {"label": "📞 Talk to Agent", "response": "Our support team is available Mon-Sat, 10AM-7PM.\n\nA human agent will be assigned to you shortly. Average wait time: 2 minutes."},
            ],
            "auto_replies": [
                {"keyword": "track", "reply": "Please share your order ID starting with #TZ"},
                {"keyword": "return", "reply": "We offer 7-day easy returns. Share your order ID to start."},
                {"keyword": "size", "reply": "Check our size guide: https://trendz.in/size-guide"},
            ],
            "business_hours": "Mon-Sat: 10AM-7PM",
            "away_message": "Thanks for reaching out! We'll reply when we're back online. 🛍️",
            "features": ["Order Tracking", "Return Processing", "Payment Help", "Live Agent Handoff"],
            "theme_primary": "#075E54",
        }),
        (ProductType.whatsapp_chatbot, "Clinic Appointment Bot", "Doctor appointment booking", "Healthcare", "modern", False, {
            "business_name": "SmileCare Dental Clinic", "whatsapp_number": "+919876510101",
            "welcome_message": "Hello! 😊 Welcome to SmileCare Dental. How can we help you with your dental needs?",
            "menu_options": [
                {"label": "📅 Book Appointment", "response": "To book an appointment, please share:\n1. Your full name\n2. Preferred date\n3. Morning (10AM-1PM) or Evening (3PM-7PM)\n\nWe'll confirm within 30 minutes!"},
                {"label": "🦷 Our Services", "response": "Our Services:\n\n✨ Teeth Whitening - ₹3,000\n🦷 Root Canal - ₹5,000\n😁 Dental Implants - ₹25,000\n💫 Braces - ₹30,000\n🧹 Cleaning & Scaling - ₹1,000\n\nAll prices are indicative. Actual cost after consultation."},
                {"label": "🕐 Timings & Location", "response": "📍 Indiranagar, Bengaluru\n🕐 Mon-Sat: 9AM-7PM\n🚫 Closed on Sundays\n📞 Emergency: +91 98765 10101"},
                {"label": "💰 Insurance & Pricing", "response": "We accept all major insurance providers:\n• Star Health\n• ICICI Lombard\n• Max Bupa\n• HDFC Ergo\n\nEMI options available for treatments above ₹10,000."},
            ],
            "auto_replies": [
                {"keyword": "appointment", "reply": "Sure! Please share your name, preferred date, and morning/evening slot."},
                {"keyword": "emergency", "reply": "For dental emergencies, call +91 98765 10101 immediately."},
                {"keyword": "cost", "reply": "Our treatments start from ₹1,000. Full pricing after consultation."},
            ],
            "business_hours": "Mon-Sat: 9AM-7PM",
            "away_message": "Our clinic is currently closed. For emergencies, call +91 98765 10101. We'll reply during working hours!",
            "features": ["Appointment Booking", "Service Info", "Insurance Help", "Emergency Support"],
            "theme_primary": "#075E54",
        }),
    ]

    templates = []
    for ptype, name, desc, industry, style, premium, config in templates_data:
        t = ProductTemplate(
            product_type=ptype, name=name, description=desc,
            industry=industry, style=style, is_premium=premium, config_json=config,
        )
        db.add(t)
        templates.append(t)

    db.commit()
    logger.info("Created %d product templates", len(templates))
    return templates


def main() -> None:
    db = SessionLocal()
    try:
        logger.info("Starting database seed...")
        admin = seed_super_admin(db)
        tenant = seed_franchise(db, admin)
        seed_customers(db, tenant)
        seed_plans(db)
        seed_templates(db)
        logger.info("Database seeded successfully!")
        logger.info("")
        logger.info("Login credentials:")
        logger.info("  Super Admin:      admin@nexastack.com / Admin@123")
        logger.info("  Franchise Owner:  franchise@nexastack.com / Franchise@123")
        logger.info("  Customer:         customer1@example.com / Customer@123")
    except Exception:
        logger.exception("Seed failed")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
