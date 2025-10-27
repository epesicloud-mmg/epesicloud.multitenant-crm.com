# 🚀 Quick Start - Postman Testing

## Step 1: Import the Collection

1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop `EpesiCRM-Postman-Collection.json` into Postman
4. The collection "EpesiCRM API - Complete Collection" will appear in your sidebar

## Step 2: Start Your Server

Make sure your development server is running:
```bash
npm run dev
```

Server should be running at: `http://localhost:5000`

## Step 3: Test Authentication

1. Open the collection: **EpesiCRM API - Complete Collection**
2. Go to **Authentication** folder
3. Click **Register New User**
4. Click **Send**

✅ **Success!** The collection will automatically:
- Save your `accessToken`
- Save your `tenantId`  
- Save your `userId`

These are now available as collection variables for all subsequent requests.

## Step 4: Test CRM Endpoints

Now you can test any endpoint! Try these in order:

### Create a Company
1. Go to **CRM - Companies** → **Create Company**
2. Click **Send**
3. ✅ Company ID is automatically saved

### Create a Contact
1. Go to **CRM - Contacts** → **Create Contact**
2. Click **Send**
3. ✅ Contact ID is automatically saved

### Create a Deal
1. Go to **CRM - Deals** → **Create Deal**
2. Click **Send**
3. ✅ Deal ID is automatically saved

### List Resources
Try listing:
- **List All Contacts**
- **List All Companies**
- **List All Deals**
- **List All Products**
- **List All Users**

## 📝 Collection Variables

The collection automatically manages these variables:

| Variable | Description | Auto-saved? |
|----------|-------------|-------------|
| `baseUrl` | API base URL | ❌ (pre-configured) |
| `accessToken` | JWT token | ✅ Yes (on register/login) |
| `tenantId` | Your tenant ID | ✅ Yes (on register/login) |
| `userId` | Your user ID | ✅ Yes (on register/login) |
| `contactId` | Last created contact | ✅ Yes (on create) |
| `companyId` | Last created company | ✅ Yes (on create) |
| `dealId` | Last created deal | ✅ Yes (on create) |
| `productId` | Last created product | ✅ Yes (on create) |

## 🔍 View/Edit Variables

1. Click on the collection name
2. Go to **Variables** tab
3. See current values (hover over the masked values to see them)

## 📖 Full Documentation

For complete endpoint documentation with all payloads, see:
- **POSTMAN_API_GUIDE.md** - Complete API reference

## ✅ What's Working

**CRM Module (100%):**
- ✅ Authentication (Register, Login)
- ✅ Contacts (List, Create, Get, Update, Delete)
- ✅ Companies (List, Create, Get, Update, Delete)
- ✅ Deals (List, Create, Get, Update, Delete)
- ✅ Products (List, Create, Get, Update, Delete)
- ✅ Users (List, Get by ID)
- ✅ Health & Stats

**Finance & HR Modules:**
- ⚠️ Not yet implemented (database schemas pending)

## 🔥 Quick Testing Workflow

1. **Register** → Gets token & tenant automatically
2. **Create Company** → Saves company ID
3. **Create Contact** → Saves contact ID  
4. **Create Deal** → Links to contact & company
5. **List All Deals** → See your created deal
6. **Update Deal** → Change the value
7. **Delete Deal** → Clean up

## 💡 Tips

- **Dynamic Values:** The collection uses `{{$timestamp}}` to generate unique values
- **Auto-Headers:** All requests automatically include your token and tenant ID
- **No Manual IDs:** Created resource IDs are auto-saved to variables
- **Test Scripts:** Responses are automatically parsed to save important IDs

## 🐛 Troubleshooting

**401 Unauthorized?**
- Your token expired or is invalid
- Re-run **Register New User** or **Login** to get a fresh token

**404 Not Found?**
- Check that the server is running on port 5000
- Verify the `baseUrl` variable is set to `http://localhost:5000`

**Validation Errors?**
- Check the request body matches the required fields
- See **POSTMAN_API_GUIDE.md** for complete payload examples

## 🎯 Next Steps

After testing manually:
1. Export your collection with test data
2. Create automated test suites
3. Set up CI/CD pipeline with Newman (Postman CLI)
4. Add environment variables for staging/production

---

**Happy Testing! 🚀**
