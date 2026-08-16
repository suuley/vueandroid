Guide for setting up MongoDB Atlas, configuring it in Vercel, and integrating your code.
 Step 1: Create Your Free MongoDB Atlas Cluster

    Go to the MongoDB Atlas Signup Page and create a free account.

    In your dashboard, click Build a Database.

    Select the Shared cluster option (M0 Free Tier — free forever, 512 MB storage).

    Choose your cloud provider, region, name your cluster, and click Create Deployment.

    Create Database User: Enter a username and password. Save these credentials!

    Configure Network Access: Add IP Access List and allow access from anywhere (0.0.0.0/0) so Vercel's functions can connect.

    Click Connect on your cluster overview, choose Drivers (Node.js), and copy your Connection String URI.

 Step 2: Configure Environment Variables in Vercel

    Go to your project dashboard on Vercel.

    Navigate to Settings > Environment Variables.

    Add your connection string:

        Key: MONGODB_URI

        Value: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority (Replace <username> and <password> with the ones you created in Step 1).

    Save and ensure it applies to Production, Preview, and Development.