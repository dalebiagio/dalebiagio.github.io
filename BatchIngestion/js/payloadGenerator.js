// Payload Generator - Generates dummy payloads based on schemas
// Uses the profile and consent schemas from /input/schema/

// Profile Schema structure (from input/schema/profile.json)
const PROFILE_SCHEMA = {
    "neustarOffline": "String",
    "neustarOnline": "String",
    "knownUUID": "String",
    "contactDetails": {
        "mktPhoneNumber": "string",
        "mktEmail": "string",
        "mktPostalAddress": {
            "addressLine1": "string",
            "addressLine2": "string",
            "addressLine3": "string",
            "city": "string",
            "state": "string",
            "country": "string",
            "zipcode": "string",
            "zipcode4": "string"
        }
    },
    "preferredLanguage": "",
    "wireless": [],
    "wireline": []
};

// Consent Schema structure (from input/schema/consent.json)
const CONSENT_SCHEMA = {
    "neustaroffline": "string",
    "neustaronline": "string",
    "knownuuid": "string",
    "wireless": [],
    "wireline": {}
};

// Random data generators
const generators = {
    uuid: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    neustarOffline: () => `NOFFE${generators.alphaNum(16)}`,
    neustarOnline: () => `NON${generators.alphaNum(15)}`,

    alphaNum: (length) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    },

    phone: () => {
        return String(Math.floor(Math.random() * 9000000000) + 1000000000);
    },

    email: (firstName, lastName) => {
        const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'];
        const num = Math.floor(Math.random() * 100);
        return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@${domains[Math.floor(Math.random() * domains.length)]}`;
    },

    date: (startYear = 2020, endYear = 2026) => {
        const start = new Date(startYear, 0, 1);
        const end = new Date(endYear, 11, 31);
        const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        return date.toISOString().split('T')[0];
    },

    timestamp: () => {
        const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        return date.toISOString();
    },

    ctn: () => String(Math.floor(Math.random() * 9000000000) + 1000000000),

    ban: () => String(Math.floor(Math.random() * 900000000) + 100000000),

    addressId: () => `ADDR${Math.floor(Math.random() * 900000000) + 100000000}`,

    itemId: () => `ITM${Math.floor(Math.random() * 90000000) + 10000000}`,

    street: () => {
        const num = Math.floor(Math.random() * 9000) + 1000;
        const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm Dr', 'Cedar Ln', 'Maple Way'];
        return `${num} ${streets[Math.floor(Math.random() * streets.length)]}`;
    },

    city: () => {
        const cities = ['Philadelphia', 'Chicago', 'Houston', 'Phoenix', 'Dallas', 'Austin', 'Denver', 'Seattle'];
        return cities[Math.floor(Math.random() * cities.length)];
    },

    state: () => {
        const states = ['AZ', 'CA', 'TX', 'NY', 'FL', 'IL', 'PA', 'OH', 'GA', 'WA'];
        return states[Math.floor(Math.random() * states.length)];
    },

    zipcode: () => String(Math.floor(Math.random() * 90000) + 10000),

    zipcode4: () => String(Math.floor(Math.random() * 9000) + 1000),

    firstName: () => {
        const names = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Jennifer', 'James', 'Emily', 'Robert', 'Lisa'];
        return names[Math.floor(Math.random() * names.length)];
    },

    lastName: () => {
        const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Taylor'];
        return names[Math.floor(Math.random() * names.length)];
    },

    boolean: () => Math.random() > 0.5,

    choice: (options) => options[Math.floor(Math.random() * options.length)],

    booleanIndicator: () => generators.choice(['Y', 'N', '']),
};

// Generate a wireless profile entry
function generateWirelessProfile() {
    const firstName = generators.firstName();
    const lastName = generators.lastName();
    const city = generators.city();
    const state = generators.state();
    const zip = generators.zipcode();
    const zip4 = generators.zipcode4();

    return {
        ctn: generators.ctn(),
        activationDate: generators.date(2019, 2024),
        subscriberStatus: generators.choice(['Active', 'Inactive', 'Suspended']),
        firstnetIndicator: generators.boolean(),
        device: {
            make: generators.choice(['Samsung', 'Apple', 'Google', 'Motorola']),
            itemId: generators.itemId(),
            model: generators.choice(['Galaxy S24', 'Galaxy S23', 'iPhone 15 Pro', 'Pixel 8 Pro', 'Edge 40'])
        },
        soc: {
            insuranceSoc: generators.choice(['PRTPLUS', 'PRTBASIC', 'PRTPREM']),
            planSoc: generators.choice(['UNLPREM5G', 'UNLPLUS5G', 'UNLSTART5G']),
            planSocEffectiveDate: generators.date(2023, 2025)
        },
        contract: {
            startDate: generators.date(2021, 2024),
            endDate: generators.date(2025, 2027),
            reasonCode: generators.choice(['NEW', 'UPGRADE', 'RENEWAL']),
            status: generators.choice(['Active', 'Pending', 'Expired'])
        },
        banDetails: {
            ban: generators.ban(),
            accountStatus: generators.choice(['Active', 'Suspended', 'Closed']),
            accountType: generators.choice(['Individual', 'Family', 'Business']),
            wirelessAccountType: generators.choice(['Postpaid', 'Prepaid']),
            wirelessAccountSubType: generators.choice(['Standard', 'Premium', 'Basic']),
            liabilityType: generators.choice(['Individual', 'Corporate']),
            autoPay: generators.boolean(),
            addressId: generators.addressId(),
            addressType: generators.choice(['Residential', 'Business']),
            addressLine1: generators.street(),
            city: city,
            billingState: state,
            billingZip: zip,
            billingZip4: zip4,
            country: 'US',
            firstName: firstName,
            lastName: lastName,
            billingLanguage: generators.choice(['EN', 'ES']),
            convergedCustomerOption: generators.choice(['Y', 'N']),
            cpniIndicator: generators.boolean()
        }
    };
}

// Generate a wireline profile entry
function generateWirelineProfile() {
    const firstName = generators.firstName();
    const lastName = generators.lastName();
    const city = generators.city();
    const state = generators.state();
    const zip = generators.zipcode();
    const zip4 = generators.zipcode4();

    return {
        ban: generators.ban(),
        maxUploadSpeed: generators.choice(['100Mbps', '500Mbps', '1Gbps', '2Gbps']),
        accountType: generators.choice(['Individual', 'Family', 'Business']),
        accountStatus: generators.choice(['Active', 'Suspended', 'Closed']),
        givenName: firstName,
        familyName: lastName,
        addressId: generators.addressId(),
        addressType: generators.choice(['Residential', 'Business']),
        addressLine1: generators.street(),
        city: city,
        country: 'US',
        billingAddressLine1: generators.street(),
        billingZip: zip,
        billingZip4: zip4,
        billingState: state,
        billingCountry: 'US',
        emailAddress: generators.email(firstName, lastName),
        phoneNumber: generators.phone(),
        productTypes: generators.choice(['Internet', 'Triple Play', 'TV + Internet', 'Phone + Internet']),
        billingLanguage: generators.choice(['EN', 'ES']),
        liabilityType: generators.choice(['Individual', 'Corporate']),
        convergedCustomerOption: generators.choice(['Y', 'N']),
        uversedtvAccountType: generators.choice(['U200', 'U300', 'U450']),
        uversedtvAccountSubType: generators.choice(['Standard', 'Premium']),
        autoPay: generators.choice(['Y', 'N']),
        contract: {
            startDate: generators.date(2021, 2024),
            endDate: generators.date(2025, 2027),
            reasonCode: generators.choice(['NEW', 'UPGRADE', 'RENEWAL']),
            status: generators.choice(['Active', 'Pending', 'Expired'])
        },
        device: {
            make: generators.choice(['Arris', 'Nokia', 'Motorola']),
            itemId: generators.itemId(),
            model: generators.choice(['BGW210', 'BGW320', 'NVG589'])
        },
        soc: {
            insuranceSoc: generators.choice(['PRTPLUS', 'PRTBASIC', 'PRTPREM']),
            planSoc: generators.choice(['FIBER1000', 'FIBER500', 'DSL50']),
            planSocEffectiveDate: generators.date(2023, 2025)
        }
    };
}

// Generate wireless consent entry
function generateWirelessConsent() {
    return {
        ctn: generators.ctn(),
        smsconsentdetails: {
            bp_sms_legal_wrls_ind: generators.booleanIndicator(),
            bp_sms_legal_bb_ind: generators.booleanIndicator(),
            bp_sms_mktg_wrls_ind: generators.booleanIndicator(),
            bp_sms_mktg_bb_ind: generators.booleanIndicator(),
            sms_mktg_consent: generators.booleanIndicator(),
            sms_mktg_consent_dt: generators.date(2023, 2025),
            bp_sms_mktg_ind: generators.booleanIndicator(),
            bp_sms_nfn_wrls_ind: generators.booleanIndicator(),
            bp_sms_nfn_bb_ind: generators.booleanIndicator()
        },
        emailconsentdetails: {
            bp_eml_mktg_ind: generators.booleanIndicator(),
            bp_eml_nfn_ind: generators.booleanIndicator(),
            bp_eml_mktg_bb_intrnt_ind: generators.booleanIndicator(),
            bp_eml_mktg_wrls_ind: generators.booleanIndicator()
        },
        banconsentdetails: {
            ban: generators.ban(),
            pushnotificaitons: {
                bp_pn_wrls_nfn_ind: generators.booleanIndicator(),
                bp_pn_wrls_mktg_ind: generators.booleanIndicator(),
                bp_pn_wrls_mktg_upgrd_ind: generators.booleanIndicator(),
                bp_pn_wrls_network_nfn_ind: generators.booleanIndicator(),
                bp_pn_bb_nfn_ind: generators.booleanIndicator(),
                bp_pn_bb_mktg_ind: generators.booleanIndicator(),
                bp_pn_bb_network_nfn_ind: generators.booleanIndicator(),
                bp_pn_bb_mktg_upgrd_ind: generators.booleanIndicator()
            },
            cpniindicator: generators.boolean(),
            privacyconsent: {
                do_not_sell_ind: generators.booleanIndicator(),
                restricted_ind: generators.booleanIndicator(),
                cease_desist_ind: generators.booleanIndicator()
            }
        }
    };
}

// Generate wireline consent entry
function generateWirelineConsent() {
    return {
        ban: generators.ban(),
        pushnotificaitons: {
            bp_pn_wrls_nfn_ind: generators.booleanIndicator(),
            bp_pn_wrls_mktg_ind: generators.booleanIndicator(),
            bp_pn_wrls_mktg_upgrd_ind: generators.booleanIndicator(),
            bp_pn_wrls_network_nfn_ind: generators.booleanIndicator(),
            bp_pn_bb_nfn_ind: generators.booleanIndicator(),
            bp_pn_bb_mktg_ind: generators.booleanIndicator(),
            bp_pn_bb_network_nfn_ind: generators.booleanIndicator(),
            bp_pn_bb_mktg_upgrd_ind: generators.booleanIndicator()
        }
    };
}

// Main generator function for Profile payload
export function generateProfilePayload(wirelessCount, wirelineCount) {
    const firstName = generators.firstName();
    const lastName = generators.lastName();
    const city = generators.city();
    const state = generators.state();
    const zip = generators.zipcode();
    const zip4 = generators.zipcode4();

    const payload = {
        neustarOffline: generators.neustarOffline(),
        neustarOnline: generators.neustarOnline(),
        knownUUID: generators.uuid(),
        contactDetails: {
            mktPhoneNumber: generators.phone(),
            mktEmail: generators.email(firstName, lastName),
            mktPostalAddress: {
                addressLine1: generators.street(),
                addressLine2: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 500) + 1}` : '',
                addressLine3: '',
                city: city,
                state: state,
                country: 'US',
                zipcode: zip,
                zipcode4: zip4
            }
        },
        preferredLanguage: generators.choice(['EN', 'ES', '']),
        wireless: [],
        wireline: []
    };

    // Generate wireless entries
    for (let i = 0; i < wirelessCount; i++) {
        payload.wireless.push(generateWirelessProfile());
    }

    // Generate wireline entries
    for (let i = 0; i < wirelineCount; i++) {
        payload.wireline.push(generateWirelineProfile());
    }

    return payload;
}

// Main generator function for Consent payload
export function generateConsentPayload(wirelessCount, wirelineCount) {
    const payload = {
        neustaroffline: generators.neustarOffline().toLowerCase(),
        neustaronline: generators.neustarOnline().toLowerCase(),
        knownuuid: generators.uuid(),
        wireless: [],
        wireline: wirelineCount > 0 ? generateWirelineConsent() : {}
    };

    // Generate wireless consent entries
    for (let i = 0; i < wirelessCount; i++) {
        payload.wireless.push(generateWirelessConsent());
    }

    return payload;
}

// ============================================
// OPTIMIZED PAYLOAD GENERATORS
// ============================================
// Key mappings for optimization (as documented in constants.js):
// Profile: nOff=neustarOffline, nOn=neustarOnline, uid=knownUUID, wl=wireless, wn=wireline
// c=ctn, ad=activationDate, ss=subscriberStatus, fni=firstnetIndicator, dv=device, mk=make, id=itemId, md=model
// sc=soc, is=insuranceSoc, ps=planSoc, ed=planSocEffectiveDate, ct=contract, sd=startDate, rc=reasonCode, st=status
// cd=contactDetails, ph=mktPhoneNumber, em=mktEmail, pa=mktPostalAddress, a1/a2/a3=addressLine1/2/3, ci=city, s=state, co=country, zp=zipcode, z4=zipcode4
// bd=banDetails, bn=ban, as=accountStatus, at=accountType, wat=wirelessAccountType, wast=wirelessAccountSubType
// lt=liabilityType, ap=autoPay, aid=addressId, aty=addressType, bs=billingState, bz=billingZip, bz4=billingZip4
// fn=firstName, ln=lastName, bl=billingLanguage, cco=convergedCustomerOption, cpni=cpniIndicator
// Wireline: us=maxUploadSpeed, gn=givenName, fmn=familyName, bal1=billingAddressLine1, bco=billingCountry
// pt=productTypes, uat=uversedtvAccountType, uast=uversedtvAccountSubType
// Consent: noff=neustaroffline, non=neustaronline, uid=knownuuid, wl=wireless, wn=wireline
// sms=smsconsentdetails, eml=emailconsentdetails, bnc=banconsentdetails, pn=pushnotificaitons, prv=privacyconsent

// Generate optimized wireless profile entry
function generateOptimizedWirelessProfile() {
    const firstName = generators.firstName();
    const lastName = generators.lastName();
    const city = generators.city();
    const state = generators.state();
    const zip = generators.zipcode();
    const zip4 = generators.zipcode4();

    return {
        c: generators.ctn(),
        ad: generators.date(2019, 2024),
        ss: generators.choice(['Active', 'Inactive', 'Suspended']),
        fni: generators.boolean(),
        dv: {
            mk: generators.choice(['Samsung', 'Apple', 'Google', 'Motorola']),
            id: generators.itemId(),
            md: generators.choice(['Galaxy S24', 'Galaxy S23', 'iPhone 15 Pro', 'Pixel 8 Pro', 'Edge 40'])
        },
        sc: {
            is: generators.choice(['PRTPLUS', 'PRTBASIC', 'PRTPREM']),
            ps: generators.choice(['UNLPREM5G', 'UNLPLUS5G', 'UNLSTART5G']),
            ed: generators.date(2023, 2025)
        },
        ct: {
            sd: generators.date(2021, 2024),
            ed: generators.date(2025, 2027),
            rc: generators.choice(['NEW', 'UPGRADE', 'RENEWAL']),
            st: generators.choice(['Active', 'Pending', 'Expired'])
        },
        cd: {
            ph: generators.phone(),
            em: generators.email(firstName, lastName),
            pa: {
                a1: generators.street(),
                a2: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 500) + 1}` : '',
                a3: '',
                ci: city,
                s: state,
                co: 'US',
                zp: zip,
                z4: zip4
            }
        },
        bd: {
            bn: generators.ban(),
            as: generators.choice(['Active', 'Suspended', 'Closed']),
            at: generators.choice(['Individual', 'Family', 'Business']),
            wat: generators.choice(['Postpaid', 'Prepaid']),
            wast: generators.choice(['Standard', 'Premium', 'Basic']),
            lt: generators.choice(['Individual', 'Corporate']),
            ap: generators.boolean(),
            aid: generators.addressId(),
            aty: generators.choice(['Residential', 'Business']),
            a1: generators.street(),
            ci: city,
            bs: state,
            bz: zip,
            bz4: zip4,
            co: 'US',
            fn: firstName,
            ln: lastName,
            bl: generators.choice(['EN', 'ES']),
            cco: generators.choice(['Y', 'N']),
            cpni: generators.boolean()
        }
    };
}

// Generate optimized wireline profile entry
function generateOptimizedWirelineProfile() {
    const firstName = generators.firstName();
    const lastName = generators.lastName();
    const city = generators.city();
    const state = generators.state();
    const zip = generators.zipcode();
    const zip4 = generators.zipcode4();

    return {
        bn: generators.ban(),
        us: generators.choice(['100Mbps', '500Mbps', '1Gbps', '2Gbps']),
        at: generators.choice(['Individual', 'Family', 'Business']),
        as: generators.choice(['Active', 'Suspended', 'Closed']),
        gn: firstName,
        fmn: lastName,
        aid: generators.addressId(),
        aty: generators.choice(['Residential', 'Business']),
        a1: generators.street(),
        ci: city,
        co: 'US',
        bal1: generators.street(),
        bz: zip,
        bz4: zip4,
        bs: state,
        bco: 'US',
        em: generators.email(firstName, lastName),
        ph: generators.phone(),
        pt: generators.choice(['Internet', 'Triple Play', 'TV + Internet', 'Phone + Internet']),
        bl: generators.choice(['EN', 'ES']),
        lt: generators.choice(['Individual', 'Corporate']),
        cco: generators.choice(['Y', 'N']),
        uat: generators.choice(['U200', 'U300', 'U450']),
        uast: generators.choice(['Standard', 'Premium']),
        ap: generators.choice(['Y', 'N']),
        ct: {
            sd: generators.date(2021, 2024),
            ed: generators.date(2025, 2027),
            rc: generators.choice(['NEW', 'UPGRADE', 'RENEWAL']),
            st: generators.choice(['Active', 'Pending', 'Expired'])
        },
        dv: {
            mk: generators.choice(['Arris', 'Nokia', 'Motorola']),
            id: generators.itemId(),
            md: generators.choice(['BGW210', 'BGW320', 'NVG589'])
        },
        sc: {
            is: generators.choice(['PRTPLUS', 'PRTBASIC', 'PRTPREM']),
            ps: generators.choice(['FIBER1000', 'FIBER500', 'DSL50']),
            ed: generators.date(2023, 2025)
        }
    };
}

// Generate optimized wireless consent entry
function generateOptimizedWirelessConsent() {
    // Use single-char or very short keys
    return {
        c: generators.ctn(),
        sms: {
            slw: generators.booleanIndicator(),
            slb: generators.booleanIndicator(),
            smw: generators.booleanIndicator(),
            smb: generators.booleanIndicator(),
            smc: generators.booleanIndicator(),
            smd: generators.date(2023, 2025),
            smi: generators.booleanIndicator(),
            snw: generators.booleanIndicator(),
            snb: generators.booleanIndicator()
        },
        eml: {
            emi: generators.booleanIndicator(),
            eni: generators.booleanIndicator(),
            ebi: generators.booleanIndicator(),
            ewi: generators.booleanIndicator()
        },
        bnc: {
            bn: generators.ban(),
            pn: {
                pwn: generators.booleanIndicator(),
                pwm: generators.booleanIndicator(),
                pwu: generators.booleanIndicator(),
                pwk: generators.booleanIndicator(),
                pbn: generators.booleanIndicator(),
                pbm: generators.booleanIndicator(),
                pbk: generators.booleanIndicator(),
                pbu: generators.booleanIndicator()
            },
            cpni: generators.boolean(),
            prv: {
                dns: generators.booleanIndicator(),
                rst: generators.booleanIndicator(),
                cd: generators.booleanIndicator()
            }
        }
    };
}

// Generate optimized wireline consent entry
function generateOptimizedWirelineConsent() {
    return {
        bn: generators.ban(),
        pn: {
            pwn: generators.booleanIndicator(),
            pwm: generators.booleanIndicator(),
            pwu: generators.booleanIndicator(),
            pwk: generators.booleanIndicator(),
            pbn: generators.booleanIndicator(),
            pbm: generators.booleanIndicator(),
            pbk: generators.booleanIndicator(),
            pbu: generators.booleanIndicator()
        }
    };
}

// Main generator function for Optimized Profile payload
export function generateOptimizedProfilePayload(wirelessCount, wirelineCount) {
    const firstName = generators.firstName();
    const lastName = generators.lastName();
    const city = generators.city();
    const state = generators.state();
    const zip = generators.zipcode();
    const zip4 = generators.zipcode4();

    const payload = {
        nOff: generators.neustarOffline(),
        nOn: generators.neustarOnline(),
        uid: generators.uuid(),
        cd: {
            ph: generators.phone(),
            em: generators.email(firstName, lastName),
            pa: {
                a1: generators.street(),
                a2: Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 500) + 1}` : '',
                a3: '',
                ci: city,
                s: state,
                co: 'US',
                zp: zip,
                z4: zip4
            }
        },
        pl: generators.choice(['EN', 'ES', '']),
        wl: [],
        wn: []
    };

    // Generate optimized wireless entries
    for (let i = 0; i < wirelessCount; i++) {
        payload.wl.push(generateOptimizedWirelessProfile());
    }

    // Generate optimized wireline entries
    for (let i = 0; i < wirelineCount; i++) {
        payload.wn.push(generateOptimizedWirelineProfile());
    }

    return payload;
}

// Main generator function for Optimized Consent payload
export function generateOptimizedConsentPayload(wirelessCount, wirelineCount) {
    const payload = {
        noff: generators.neustarOffline().toLowerCase(),
        non: generators.neustarOnline().toLowerCase(),
        uid: generators.uuid(),
        wl: [],
        wn: wirelineCount > 0 ? generateOptimizedWirelineConsent() : {}
    };

    // Generate optimized wireless consent entries
    for (let i = 0; i < wirelessCount; i++) {
        payload.wl.push(generateOptimizedWirelessConsent());
    }

    return payload;
}

// Export schemas for display
export const SCHEMAS = {
    profile: PROFILE_SCHEMA,
    consent: CONSENT_SCHEMA
};
