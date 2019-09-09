var threesixty_registry = 'https://storage.googleapis.com/datagetter-360giving-output/branch/master/coverage.json';
var threesixty_status = 'https://storage.googleapis.com/datagetter-360giving-output/branch/master/status.json';

// identifier for very large BLF file
var blf_file = 'a002400000Z58cqAAB';

var required_fields = {
    "grants": [
        "/grants/amountAwarded",
        "/grants/awardDate",
        "/grants/currency",
        "/grants/description",
        "/grants/id",
        "/grants/title",
    ],
    "recipientOrganization": [
        "/grants/recipientOrganization/id",
        "/grants/recipientOrganization/name",
    ],
    "fundingOrganization": [
        "/grants/fundingOrganization/id",
        "/grants/fundingOrganization/name"
    ]
}

var recommended_fields = {
    "recipientOrganization/Location": [
        "/grants/recipientOrganization/location/geoCode",
        "/grants/recipientOrganization/location/geoCodeType",
        "/grants/recipientOrganization/location/name",
        "/grants/recipientOrganization/postalCode",
    ],
    "beneficiaryLocation": [
        "/grants/beneficiaryLocation/geoCode",
        "/grants/beneficiaryLocation/geoCodeType",
        "/grants/beneficiaryLocation/name",
    ],
    "recipientOrganization": [
        "/grants/recipientOrganization/charityNumber",
        "/grants/recipientOrganization/companyNumber",
    ],
    "classifications": [
        "/grants/classifications/title",
        "/grants/classifications/vocabulary",
    ],
    "grantProgramme": [
        "/grants/grantProgramme/title",
    ],
    "plannedDates": [
        "/grants/plannedDates/duration",
        "/grants/plannedDates/endDate",
        "/grants/plannedDates/startDate",
    ],
    "metadata": [
        "/grants/dataSource",
        "/grants/dateModified"
    ]
}

var lottery_funders = [
    "GB-COH-RC000766",
    "360G-blf",
    "GB-CHC-1036733",
    "GB-GOR-PC390",
];

var local_government_prefixes = [
    "GB-LAE-", "GB-LAN-", "GB-LAS-", "GB-PLA-"
];