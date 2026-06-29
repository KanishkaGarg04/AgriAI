import streamlit as st
import pandas as pd
import joblib
from datetime import date

st.set_page_config(
    page_title="AgriPrice AI",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="collapsed"
)


st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    html, body, [class*="css"] { font-family: 'Poppins', sans-serif; }
    .stApp { background: linear-gradient(180deg, #F7FBF4 0%, #EEF7EC 100%); color: #1F2937; }
    .block-container { padding-top: 1.5rem; padding-bottom: 2rem; }

    .main-header {
        background: linear-gradient(135deg, #0F766E 0%, #22C55E 100%);
        padding: 2rem 2.2rem;
        border-radius: 22px;
        margin-bottom: 1.5rem;
        text-align: center;
        color: white;
        box-shadow: 0 12px 30px rgba(15, 118, 110, 0.25);
    }
    .main-header h1 { font-size: 3rem; margin-bottom: 0.35rem; font-weight: 700; }
    .main-header p { font-size: 1.05rem; margin: 0; opacity: 0.95; }

    .section-header {
        background: #FFFFFF;
        padding: 1rem 1.2rem;
        border-radius: 16px;
        border: 1px solid #DDEBDD;
        border-left: 6px solid #14B8A6;
        margin: 1.2rem 0 1rem 0;
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
    }
    .section-header h3 { margin: 0; color: #14532D; font-weight: 700; font-size: 1.08rem; }

    .prediction-box {
        background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 45%, #CCFBF1 100%);
        border: 1px solid #6EE7B7;
        border-radius: 22px;
        padding: 2rem;
        text-align: center;
        margin-top: 1.6rem;
        box-shadow: 0 14px 30px rgba(16, 185, 129, 0.15);
    }

    .stButton > button {
        background: linear-gradient(135deg, #0F766E 0%, #16A34A 100%);
        color: white;
        font-size: 1.05rem;
        font-weight: 600;
        padding: 0.8rem 1.5rem;
        border-radius: 14px;
        border: none;
        width: 100%;
        height: 3.4rem;
        box-shadow: 0 8px 20px rgba(22, 163, 74, 0.25);
    }
    .stButton > button:hover { transform: translateY(-2px); }

    .stTextInput > div > div > input,
    .stNumberInput > div > div > input,
    .stSelectbox > div > div,
    .stMultiSelect > div > div {
        background-color: #FFFFFF !important;
        border-radius: 12px !important;
        border: 1px solid #D7E3D7 !important;
        color: #111827 !important;
    }

    .stDateInput input {
        background-color: #FFFFFF !important;
        border-radius: 12px !important;
        border: 1px solid #D7E3D7 !important;
        color: #111827 !important;
    }

    .stTextInput label, .stNumberInput label, .stSelectbox label, .stDateInput label {
        color: #14532D !important;
        font-weight: 600 !important;
    }

    .stInfo {
        background-color: #F0FDF4 !important;
        border: 1px solid #BBF7D0 !important;
        color: #166534 !important;
        border-radius: 14px !important;
    }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="main-header">
    <h1>🌾 AgriPrice AI</h1>
    <p>Smart Crop Price Prediction for Farmers, Traders, and Agri Businesses</p>
</div>
""", unsafe_allow_html=True)

@st.cache_resource
def load_model():
    try:
        return joblib.load("crop_price_model.pkl")
    except FileNotFoundError:
        st.error("Model file 'crop_price_model.pkl' not found.")
        st.stop()

model = load_model()


STATE_OPTIONS = ["Maharashtra", "Madhya Pradesh", "Karnataka", "Punjab", "Haryana", "Gujarat", "Rajasthan", "Uttar Pradesh"]
DISTRICT_OPTIONS = {
    "Maharashtra": ["Pune", "Nashik", "Nagpur", "Mumbai", "Aurangabad"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Balaghat"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Belagavi"],
    "Punjab": ["Ludhiana", "Amritsar", "Patiala"],
    "Haryana": ["Gurugram", "Hisar", "Karnal"],
    "Gujarat": ["Ahmedabad", "Surat", "Rajkot"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra"]
}
COMMODITY_OPTIONS = ["Onion", "Potato", "Tomato", "Wheat", "Rice", "Maize", "Soybean", "Chilli"]
VARIETY_OPTIONS = ["Local", "Red Onion", "White Onion", "Desi", "Hybrid", "FAQ"]
GRADE_OPTIONS = ["A", "B", "C", "FAQ", "Local"]

st.markdown('<div class="section-header"><h3>⚙️ Input Mode</h3></div>', unsafe_allow_html=True)
advanced_mode = st.toggle("Enable Advanced Options", value=False)

col1, col2 = st.columns([1.05, 0.95])

with col1:
    st.markdown('<div class="section-header"><h3>📍 Location Details</h3></div>', unsafe_allow_html=True)

    state = st.selectbox("State", STATE_OPTIONS, index=0)

    district_list = DISTRICT_OPTIONS.get(state, ["Other"])
    district = st.selectbox("District", district_list, index=0)

    if advanced_mode:
        custom_market = st.checkbox("Enter custom market name")
        if custom_market:
            market = st.text_input("Market", placeholder="e.g., Pune APMC")
        else:
            market = st.selectbox("Market", ["APMC", "Main Market", "Wholesale Market", "Retail Market", "Other"], index=0)
    else:
        market = st.selectbox("Market", ["APMC", "Main Market", "Wholesale Market", "Retail Market"], index=0)

with col2:
    st.markdown('<div class="section-header"><h3>🌱 Crop Details</h3></div>', unsafe_allow_html=True)

    commodity = st.selectbox("Commodity", COMMODITY_OPTIONS, index=0)

    if advanced_mode:
        use_custom_variety = st.checkbox("Enter custom variety")
        if use_custom_variety:
            variety = st.text_input("Variety", placeholder="e.g., Premium Red")
        else:
            variety = st.selectbox("Variety", VARIETY_OPTIONS, index=0)
    else:
        variety = st.selectbox("Variety", VARIETY_OPTIONS, index=0)

st.markdown('<div class="section-header"><h3>📊 Price & Grade Information</h3></div>', unsafe_allow_html=True)

grade_col, price_col = st.columns(2)

with grade_col:
    grade = st.selectbox("Grade", GRADE_OPTIONS, index=0)

with price_col:
    min_price = st.slider("Minimum Price (₹)", min_value=0.0, max_value=50000.0, value=1000.0, step=50.0)
    max_price = st.slider("Maximum Price (₹)", min_value=0.0, max_value=50000.0, value=2000.0, step=50.0)

st.markdown('<div class="section-header"><h3>📅 Prediction Date</h3></div>', unsafe_allow_html=True)

date_col1, date_col2 = st.columns([1, 1])

with date_col1:
    price_date = st.date_input("Select Price Date", value=date.today())

with date_col2:
    st.write("")
    st.write("")
    st.info(f"Selected Date: {price_date.strftime('%d %B %Y')}")

day, month, year = price_date.day, price_date.month, price_date.year

predict_col = st.columns([1, 2, 1])[1]
with predict_col:
    predict_btn = st.button("🚀 Predict Modal Price", use_container_width=True)

if predict_btn:
    sample = pd.DataFrame({
        "STATE": [state.upper()],
        "District Name": [district],
        "Market Name": [market],
        "Commodity": [commodity],
        "Variety": [variety],
        "Grade": [grade],
        "Min_Price": [min_price],
        "Max_Price": [max_price],
        "Day": [day],
        "Month": [month],
        "Year": [year]
    })

    try:
        prediction = model.predict(sample)[0]
        st.markdown(f"""
        <div class="prediction-box">
            <h2 style="color: #064E3B; margin-bottom: 0.5rem;">💰 Predicted Modal Price</h2>
            <h1 style="color: #047857; font-size: 3.4rem; margin: 0;">₹ {prediction:,.2f}</h1>
            <p style="color: #0F766E; font-size: 1.05rem; margin-top: 0.5rem;">Per Quintal</p>
        </div>
        """, unsafe_allow_html=True)
    except Exception as e:
        st.error(f"Prediction failed. Error: {str(e)}")

st.markdown("---")
st.markdown(
    "<div style='text-align: center; color: #6B7280; font-size: 0.9rem;'>AgriPrice AI • Built for farmers and traders</div>",
    unsafe_allow_html=True
)