# Azure Cosmos DB Setup Guide

This guide walks you through setting up Azure Cosmos DB for persistent data storage in the Crispy Goggles application.

## Prerequisites

- Azure account with appropriate permissions
- Azure CLI installed (optional, for command-line setup)
- Cosmos DB account creation permissions

## Step 1: Create Cosmos DB Account

### Option A: Azure Portal

1. Navigate to the Azure portal (portal.azure.com)
2. Click **"Create a resource"** → **"Azure Cosmos DB"**
3. Select **"Create"** under **"Azure Cosmos DB for NoSQL"**
4. Fill in the account details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing (e.g., `crispy-goggles-rg`)
   - **Account Name**: `crispy-goggles-cosmos` (must be globally unique)
   - **Location**: Choose your preferred region (recommend Central Sweden for compliance)
   - **Capacity mode**: Select **"Provisioned throughput"** for predictable costs
   - **Apply Free Tier Discount**: Yes (if available)
   - **Limit total account throughput**: Check this option to control costs

### Option B: Azure CLI

```bash
# Create resource group (if not exists)
az group create --name crispy-goggles-rg --location "Sweden Central"

# Create Cosmos DB account
az cosmosdb create \
  --resource-group crispy-goggles-rg \
  --name crispy-goggles-cosmos \
  --kind GlobalDocumentDB \
  --locations regionName="Sweden Central" failoverPriority=0 isZoneRedundant=False \
  --default-consistency-level "Session" \
  --enable-automatic-failover false \
  --enable-multiple-write-locations false
```

## Step 2: Create Database and Collections

### Database Structure

The application uses a single database with the following collections:

- **Database Name**: `CrispyGogglesDB`
- **Collections**:
  - `users` - User profiles and authentication data
  - `friendships` - Friend relationships and requests
  - `groups` - Group information and membership
  - `posts` - Posts within groups and events
  - `comments` - Comments on posts
  - `events` - Event information and RSVPs

### Create Database and Collections

1. In the Azure portal, go to your Cosmos DB account
2. Select **"Data Explorer"**
3. Click **"New Database"**
   - Database id: `CrispyGogglesDB`
   - Provision database throughput: Unchecked (we'll provision per collection)

4. Create each collection with these settings:
   
   **Users Collection:**
   - Container id: `users`
   - Partition key: `/id`
   - Throughput: 400 RU/s (manual)

   **Friendships Collection:**
   - Container id: `friendships`
   - Partition key: `/userId`
   - Throughput: 400 RU/s (manual)

   **Groups Collection:**
   - Container id: `groups`
   - Partition key: `/id`
   - Throughput: 400 RU/s (manual)

   **Posts Collection:**
   - Container id: `posts`
   - Partition key: `/groupId`
   - Throughput: 400 RU/s (manual)

   **Comments Collection:**
   - Container id: `comments`
   - Partition key: `/postId`
   - Throughput: 400 RU/s (manual)

   **Events Collection:**
   - Container id: `events`
   - Partition key: `/id`
   - Throughput: 400 RU/s (manual)

## Step 3: Get Connection Information

1. In your Cosmos DB account, go to **"Keys"**
2. Copy the following values:
   - **URI**: The endpoint URL
   - **PRIMARY KEY**: The primary key for authentication
   - **CONNECTION STRING**: The full connection string (alternative)

## Step 4: Environment Configuration

### Backend Configuration

Add these variables to your `server/.env` file:

```env
# Azure Cosmos DB Configuration
COSMOS_DB_ENDPOINT=https://your-account-name.documents.azure.com:443/
COSMOS_DB_KEY=your-primary-key-here
COSMOS_DB_DATABASE_NAME=CrispyGogglesDB

# Alternative: Use connection string instead of endpoint + key
# COSMOS_DB_CONNECTION_STRING=your-connection-string-here
```

### Update .env.example

Add the same variables to `server/.env.example`:

```env
# Azure Cosmos DB Configuration
COSMOS_DB_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
COSMOS_DB_KEY=your_cosmos_primary_key_here
COSMOS_DB_DATABASE_NAME=CrispyGogglesDB
```

## Step 5: Data Models

### Document Schemas

**User Document:**
```json
{
  "id": "user-uuid",
  "type": "user",
  "azureId": "azure-external-id",
  "email": "user@example.com",
  "name": "John Doe",
  "bio": "Software developer",
  "contactDetails": {
    "phone": "+1234567890",
    "website": "https://johndoe.com"
  },
  "role": "member", // "global_admin", "group_admin", "member"
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Friendship Document:**
```json
{
  "id": "friendship-uuid",
  "type": "friendship",
  "userId": "user1-uuid",
  "friendId": "user2-uuid", 
  "status": "pending", // "pending", "accepted", "rejected"
  "requestedBy": "user1-uuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Group Document:**
```json
{
  "id": "group-uuid",
  "type": "group",
  "name": "Tech Enthusiasts",
  "description": "A group for technology discussions",
  "tags": ["technology", "programming", "innovation"],
  "adminIds": ["user-uuid"],
  "memberIds": ["user1-uuid", "user2-uuid"],
  "membershipRequests": ["user3-uuid"],
  "isPublic": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Post Document:**
```json
{
  "id": "post-uuid",
  "type": "post",
  "authorId": "user-uuid",
  "groupId": "group-uuid", // or eventId for event posts
  "eventId": null, // null for group posts, eventId for event posts
  "content": "This is a post content",
  "attachments": [],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Comment Document:**
```json
{
  "id": "comment-uuid",
  "type": "comment",
  "postId": "post-uuid",
  "authorId": "user-uuid",
  "content": "This is a comment",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Event Document:**
```json
{
  "id": "event-uuid",
  "type": "event",
  "organizerId": "user-uuid",
  "title": "Tech Meetup 2024",
  "description": "Annual technology meetup",
  "location": "Stockholm, Sweden",
  "startDate": "2024-06-15T18:00:00Z",
  "endDate": "2024-06-15T22:00:00Z",
  "invitedUserIds": ["user1-uuid", "user2-uuid"],
  "invitedGroupIds": ["group-uuid"],
  "rsvps": [
    {
      "userId": "user1-uuid",
      "status": "attending", // "attending", "not_attending", "maybe"
      "respondedAt": "2024-01-16T10:30:00Z"
    }
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Step 6: Security Configuration

### Azure Key Vault Integration (Production)

For production deployments, use Azure Key Vault to store sensitive connection information:

1. Create an Azure Key Vault instance
2. Store Cosmos DB connection details as secrets
3. Configure your application to retrieve secrets from Key Vault
4. Use managed identity for secure access

### Connection Security

- Always use HTTPS endpoints
- Rotate keys regularly
- Use least-privilege access principles
- Enable firewall rules to restrict access to specific IP ranges
- Consider using private endpoints for enhanced security

## Step 7: Testing the Connection

After setting up your environment variables, test the connection:

```bash
# Start the backend server
npm run dev:backend

# The server should log successful database connection
# Check the health endpoint
curl http://localhost:5000/health
```

## Cost Optimization Tips

1. **Use Manual Throughput**: Start with 400 RU/s per collection and scale as needed
2. **Monitor Usage**: Use Azure Cost Management to track spending
3. **Free Tier**: Utilize the first 1000 RU/s and 25 GB storage for free
4. **Auto-scale**: Consider auto-scale for production workloads with variable traffic
5. **Archive Old Data**: Implement data lifecycle policies for cost management

## Troubleshooting

### Common Issues

1. **Connection Timeout**: Check firewall settings and endpoint URL
2. **Authentication Errors**: Verify primary key and endpoint
3. **Partition Key Errors**: Ensure partition key is included in queries
4. **Throughput Exceeded**: Monitor RU consumption and scale accordingly

### Error Messages

- `Request rate too large`: Increase RU/s or implement retry logic
- `Forbidden`: Check authentication credentials
- `Not Found`: Verify database and collection names
- `Conflict`: Document with same ID already exists

## Next Steps

1. Install the Azure Cosmos DB SDK: `npm install @azure/cosmos`
2. Implement database connection logic in your backend
3. Create API endpoints for CRUD operations
4. Test data operations with your application
5. Implement proper error handling and logging