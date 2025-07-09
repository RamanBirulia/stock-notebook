-- Seed data for symbols table with 100+ popular stocks
-- This migration adds popular stocks from various sectors for testing

INSERT INTO symbols (symbol, company_name, description, sector, industry, exchange, market_cap_category, country, currency, is_active) VALUES
-- Technology - Large Cap
('AAPL', 'Apple Inc.', 'Designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.', 'Technology', 'Consumer Electronics', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('MSFT', 'Microsoft Corporation', 'Develops and licenses software, services, devices, and solutions worldwide.', 'Technology', 'Software—Infrastructure', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('GOOGL', 'Alphabet Inc. Class A', 'Provides online advertising services and cloud computing solutions.', 'Technology', 'Internet Content & Information', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('GOOG', 'Alphabet Inc. Class C', 'Provides online advertising services and cloud computing solutions.', 'Technology', 'Internet Content & Information', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('AMZN', 'Amazon.com, Inc.', 'Engages in the retail sale of consumer products and subscriptions through online and physical stores.', 'Technology', 'Internet Retail', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('META', 'Meta Platforms, Inc.', 'Operates social networking platforms and develops virtual and augmented reality technologies.', 'Technology', 'Internet Content & Information', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('TSLA', 'Tesla, Inc.', 'Designs, develops, manufactures, and sells electric vehicles and energy storage systems.', 'Technology', 'Auto Manufacturers', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('NVDA', 'NVIDIA Corporation', 'Designs graphics processing units and system on a chip units for mobile and automotive markets.', 'Technology', 'Semiconductors', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('ORCL', 'Oracle Corporation', 'Provides database software and cloud computing solutions.', 'Technology', 'Software—Infrastructure', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('CRM', 'Salesforce, Inc.', 'Provides customer relationship management software and applications.', 'Technology', 'Software—Application', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('ADBE', 'Adobe Inc.', 'Provides digital marketing and media solutions.', 'Technology', 'Software—Application', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('NFLX', 'Netflix, Inc.', 'Provides entertainment services and streaming content.', 'Technology', 'Entertainment', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('INTC', 'Intel Corporation', 'Designs and manufactures microprocessors and semiconductor components.', 'Technology', 'Semiconductors', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('AMD', 'Advanced Micro Devices, Inc.', 'Designs and produces microprocessors and related technologies.', 'Technology', 'Semiconductors', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('PYPL', 'PayPal Holdings, Inc.', 'Provides digital payment solutions and services.', 'Technology', 'Software—Application', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),

-- Technology - Mid Cap
('EPAM', 'EPAM Systems, Inc.', 'Provides digital platform engineering and development services.', 'Technology', 'Information Technology Services', 'NYSE', 'MID', 'US', 'USD', TRUE),
('SNOW', 'Snowflake Inc.', 'Provides cloud-based data platform services.', 'Technology', 'Software—Application', 'NYSE', 'MID', 'US', 'USD', TRUE),
('PLTR', 'Palantir Technologies Inc.', 'Provides software platforms for data analytics and artificial intelligence.', 'Technology', 'Software—Application', 'NYSE', 'MID', 'US', 'USD', TRUE),
('UBER', 'Uber Technologies, Inc.', 'Provides ride-hailing and food delivery services.', 'Technology', 'Software—Application', 'NYSE', 'MID', 'US', 'USD', TRUE),
('TWTR', 'Twitter, Inc.', 'Operates social networking platform and microblogging service.', 'Technology', 'Internet Content & Information', 'NYSE', 'MID', 'US', 'USD', TRUE),

-- Financial Services
('JPM', 'JPMorgan Chase & Co.', 'Provides financial services including investment banking and asset management.', 'Financial Services', 'Banks—Diversified', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('BAC', 'Bank of America Corporation', 'Provides banking and financial services.', 'Financial Services', 'Banks—Diversified', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('WFC', 'Wells Fargo & Company', 'Provides banking, investment, and mortgage services.', 'Financial Services', 'Banks—Diversified', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('GS', 'The Goldman Sachs Group, Inc.', 'Provides investment banking and financial services.', 'Financial Services', 'Capital Markets', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('MS', 'Morgan Stanley', 'Provides investment banking and wealth management services.', 'Financial Services', 'Capital Markets', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('V', 'Visa Inc.', 'Operates payment processing networks and provides related services.', 'Financial Services', 'Credit Services', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('MA', 'Mastercard Incorporated', 'Provides payment processing and technology services.', 'Financial Services', 'Credit Services', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('AXP', 'American Express Company', 'Provides charge and credit payment card products and travel services.', 'Financial Services', 'Credit Services', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('BRK.B', 'Berkshire Hathaway Inc. Class B', 'Operates as a holding company with diverse business interests.', 'Financial Services', 'Insurance—Diversified', 'NYSE', 'LARGE', 'US', 'USD', TRUE),

-- Healthcare
('JNJ', 'Johnson & Johnson', 'Develops and manufactures pharmaceutical and medical device products.', 'Healthcare', 'Drug Manufacturers—General', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('PFE', 'Pfizer Inc.', 'Develops, manufactures, and sells pharmaceutical products.', 'Healthcare', 'Drug Manufacturers—General', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('UNH', 'UnitedHealth Group Incorporated', 'Provides health care coverage and services.', 'Healthcare', 'Healthcare Plans', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('ABBV', 'AbbVie Inc.', 'Develops and commercializes pharmaceutical products.', 'Healthcare', 'Drug Manufacturers—General', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('TMO', 'Thermo Fisher Scientific Inc.', 'Provides analytical instruments and laboratory equipment.', 'Healthcare', 'Diagnostics & Research', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('ABT', 'Abbott Laboratories', 'Develops and manufactures health care products.', 'Healthcare', 'Medical Devices', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('MRNA', 'Moderna, Inc.', 'Develops messenger RNA therapeutics and vaccines.', 'Healthcare', 'Biotechnology', 'NASDAQ', 'MID', 'US', 'USD', TRUE),
('GILD', 'Gilead Sciences, Inc.', 'Develops and commercializes therapeutics.', 'Healthcare', 'Drug Manufacturers—General', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),

-- Consumer Discretionary
('HD', 'The Home Depot, Inc.', 'Operates home improvement retail stores.', 'Consumer Discretionary', 'Home Improvement Retail', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('MCD', 'McDonald''s Corporation', 'Operates and franchises quick-service restaurants.', 'Consumer Discretionary', 'Restaurants', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('NKE', 'NIKE, Inc.', 'Designs, develops, and sells athletic footwear, apparel, and accessories.', 'Consumer Discretionary', 'Footwear & Accessories', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('SBUX', 'Starbucks Corporation', 'Operates coffee shops and sells coffee products.', 'Consumer Discretionary', 'Restaurants', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),

-- Consumer Staples
('PG', 'The Procter & Gamble Company', 'Manufactures and sells consumer goods.', 'Consumer Staples', 'Household & Personal Products', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('KO', 'The Coca-Cola Company', 'Manufactures and sells soft drinks and beverages.', 'Consumer Staples', 'Beverages—Non-Alcoholic', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('PEP', 'PepsiCo, Inc.', 'Manufactures and sells food and beverage products.', 'Consumer Staples', 'Beverages—Non-Alcoholic', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('WMT', 'Walmart Inc.', 'Operates retail stores and e-commerce platforms.', 'Consumer Staples', 'Discount Stores', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('COST', 'Costco Wholesale Corporation', 'Operates membership warehouses.', 'Consumer Staples', 'Discount Stores', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),

-- Energy
('XOM', 'Exxon Mobil Corporation', 'Explores, produces, and sells crude oil and natural gas.', 'Energy', 'Oil & Gas Integrated', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('CVX', 'Chevron Corporation', 'Engages in oil and gas exploration and production.', 'Energy', 'Oil & Gas Integrated', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('COP', 'ConocoPhillips', 'Explores, produces, and markets crude oil and natural gas.', 'Energy', 'Oil & Gas E&P', 'NYSE', 'LARGE', 'US', 'USD', TRUE),

-- Industrials
('BA', 'The Boeing Company', 'Designs, manufactures, and sells aircraft and defense systems.', 'Industrials', 'Aerospace & Defense', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('CAT', 'Caterpillar Inc.', 'Manufactures construction and mining equipment.', 'Industrials', 'Farm & Construction Equipment', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('GE', 'General Electric Company', 'Operates as a high-tech industrial company.', 'Industrials', 'Specialty Industrial Machinery', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('UPS', 'United Parcel Service, Inc.', 'Provides package delivery and logistics services.', 'Industrials', 'Integrated Freight & Logistics', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('FDX', 'FedEx Corporation', 'Provides transportation and logistics services.', 'Industrials', 'Integrated Freight & Logistics', 'NYSE', 'LARGE', 'US', 'USD', TRUE),

-- Materials
('LIN', 'Linde plc', 'Produces and distributes atmospheric and process gases.', 'Materials', 'Specialty Chemicals', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('DD', 'DuPont de Nemours, Inc.', 'Provides specialty chemical products and materials.', 'Materials', 'Specialty Chemicals', 'NYSE', 'LARGE', 'US', 'USD', TRUE),

-- Utilities
('NEE', 'NextEra Energy, Inc.', 'Generates, transmits, and distributes electric power.', 'Utilities', 'Utilities—Regulated Electric', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('DUK', 'Duke Energy Corporation', 'Generates, transmits, and distributes electricity.', 'Utilities', 'Utilities—Regulated Electric', 'NYSE', 'LARGE', 'US', 'USD', TRUE),

-- Real Estate
('AMT', 'American Tower Corporation', 'Owns and operates wireless communications infrastructure.', 'Real Estate', 'REIT—Specialty', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('PLD', 'Prologis, Inc.', 'Owns and operates logistics real estate.', 'Real Estate', 'REIT—Industrial', 'NYSE', 'LARGE', 'US', 'USD', TRUE),

-- Communication Services
('VZ', 'Verizon Communications Inc.', 'Provides communications and technology services.', 'Communication Services', 'Telecom Services', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('T', 'AT&T Inc.', 'Provides telecommunications and media services.', 'Communication Services', 'Telecom Services', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('CMCSA', 'Comcast Corporation', 'Provides cable communications and entertainment services.', 'Communication Services', 'Entertainment', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('DIS', 'The Walt Disney Company', 'Operates entertainment and media businesses.', 'Communication Services', 'Entertainment', 'NYSE', 'LARGE', 'US', 'USD', TRUE),

-- Additional Popular Stocks
('BABA', 'Alibaba Group Holding Limited', 'Provides e-commerce and cloud computing services.', 'Technology', 'Internet Retail', 'NYSE', 'LARGE', 'CN', 'USD', TRUE),
('TSM', 'Taiwan Semiconductor Manufacturing Company Limited', 'Manufactures integrated circuits and semiconductors.', 'Technology', 'Semiconductors', 'NYSE', 'LARGE', 'TW', 'USD', TRUE),
('ASML', 'ASML Holding N.V.', 'Develops and manufactures semiconductor manufacturing equipment.', 'Technology', 'Semiconductor Equipment & Materials', 'NASDAQ', 'LARGE', 'NL', 'USD', TRUE),
('AVGO', 'Broadcom Inc.', 'Designs and develops semiconductor devices.', 'Technology', 'Semiconductors', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('TXN', 'Texas Instruments Incorporated', 'Designs and manufactures analog and embedded semiconductors.', 'Technology', 'Semiconductors', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('QCOM', 'QUALCOMM Incorporated', 'Develops wireless telecommunications products.', 'Technology', 'Semiconductors', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),

-- Crypto-related
('COIN', 'Coinbase Global, Inc.', 'Provides cryptocurrency exchange and trading services.', 'Financial Services', 'Capital Markets', 'NASDAQ', 'MID', 'US', 'USD', TRUE),
('MSTR', 'MicroStrategy Incorporated', 'Provides business intelligence and analytics software.', 'Technology', 'Software—Application', 'NASDAQ', 'MID', 'US', 'USD', TRUE),

-- Biotech
('BIIB', 'Biogen Inc.', 'Develops and commercializes therapies for neurological diseases.', 'Healthcare', 'Biotechnology', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('REGN', 'Regeneron Pharmaceuticals, Inc.', 'Develops and commercializes medicines for serious diseases.', 'Healthcare', 'Biotechnology', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('VRTX', 'Vertex Pharmaceuticals Incorporated', 'Develops and commercializes small molecule drugs.', 'Healthcare', 'Biotechnology', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),

-- Retail
('TGT', 'Target Corporation', 'Operates general merchandise stores.', 'Consumer Discretionary', 'Discount Stores', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('LOW', 'Lowe''s Companies, Inc.', 'Operates home improvement stores.', 'Consumer Discretionary', 'Home Improvement Retail', 'NYSE', 'LARGE', 'US', 'USD', TRUE),

-- Semiconductor
('MU', 'Micron Technology, Inc.', 'Manufactures memory and storage products.', 'Technology', 'Semiconductors', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('AMAT', 'Applied Materials, Inc.', 'Provides manufacturing equipment for semiconductor industry.', 'Technology', 'Semiconductor Equipment & Materials', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('LRCX', 'Lam Research Corporation', 'Manufactures equipment for semiconductor processing.', 'Technology', 'Semiconductor Equipment & Materials', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),

-- Software
('NOW', 'ServiceNow, Inc.', 'Provides cloud-based platform for digital workflows.', 'Technology', 'Software—Application', 'NYSE', 'LARGE', 'US', 'USD', TRUE),
('TEAM', 'Atlassian Corporation Plc', 'Develops software development and collaboration tools.', 'Technology', 'Software—Application', 'NASDAQ', 'MID', 'AU', 'USD', TRUE),
('SPLK', 'Splunk Inc.', 'Provides software platforms for real-time operational intelligence.', 'Technology', 'Software—Application', 'NASDAQ', 'MID', 'US', 'USD', TRUE),

-- Electric Vehicles
('NIO', 'NIO Inc.', 'Designs and manufactures electric vehicles.', 'Consumer Discretionary', 'Auto Manufacturers', 'NYSE', 'MID', 'CN', 'USD', TRUE),
('RIVN', 'Rivian Automotive, Inc.', 'Develops electric vehicles and automotive technology.', 'Consumer Discretionary', 'Auto Manufacturers', 'NASDAQ', 'MID', 'US', 'USD', TRUE),
('LCID', 'Lucid Group, Inc.', 'Develops electric vehicles and related technologies.', 'Consumer Discretionary', 'Auto Manufacturers', 'NASDAQ', 'MID', 'US', 'USD', TRUE),

-- Streaming and Entertainment
('ROKU', 'Roku, Inc.', 'Provides streaming platform for television content.', 'Technology', 'Software—Application', 'NASDAQ', 'MID', 'US', 'USD', TRUE),
('SPOT', 'Spotify Technology S.A.', 'Provides audio streaming platform services.', 'Technology', 'Internet Content & Information', 'NYSE', 'MID', 'SE', 'USD', TRUE),

-- Gaming
('ATVI', 'Activision Blizzard, Inc.', 'Develops and publishes interactive entertainment content.', 'Technology', 'Electronic Gaming & Multimedia', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('EA', 'Electronic Arts Inc.', 'Develops and publishes video games.', 'Technology', 'Electronic Gaming & Multimedia', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),
('TTWO', 'Take-Two Interactive Software, Inc.', 'Develops and publishes video games.', 'Technology', 'Electronic Gaming & Multimedia', 'NASDAQ', 'LARGE', 'US', 'USD', TRUE),

-- Cybersecurity
('CRWD', 'CrowdStrike Holdings, Inc.', 'Provides cybersecurity technology and services.', 'Technology', 'Software—Infrastructure', 'NASDAQ', 'MID', 'US', 'USD', TRUE),
('OKTA', 'Okta, Inc.', 'Provides identity and access management solutions.', 'Technology', 'Software—Infrastructure', 'NASDAQ', 'MID', 'US', 'USD', TRUE),
('ZS', 'Zscaler, Inc.', 'Provides cloud security services.', 'Technology', 'Software—Infrastructure', 'NASDAQ', 'MID', 'US', 'USD', TRUE),

-- Data Analytics
('DDOG', 'Datadog, Inc.', 'Provides monitoring and analytics platform for cloud applications.', 'Technology', 'Software—Application', 'NASDAQ', 'MID', 'US', 'USD', TRUE),
('MDB', 'MongoDB, Inc.', 'Provides database platform for building applications.', 'Technology', 'Software—Application', 'NASDAQ', 'MID', 'US', 'USD', TRUE);

-- Update statistics
ANALYZE symbols;
