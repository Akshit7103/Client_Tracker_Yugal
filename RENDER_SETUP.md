# Render Deployment Setup Guide

## Setting Up Environment Variables for Email Features

To enable email reminders on Render, you need to set environment variables.

### Step-by-Step Instructions

1. **Go to Your Render Dashboard**
   - Visit: https://dashboard.render.com
   - Select your web service

2. **Navigate to Environment Variables**
   - Click on your service name
   - Go to the **"Environment"** tab in the left sidebar

3. **Add Environment Variables**

Click "Add Environment Variable" and add each of these:

| Key | Value (Example) | Description |
|-----|-----------------|-------------|
| `SENDGRID_API_KEY` | `SG.xxxxx...` | Your SendGrid API key (from SendGrid dashboard) |
| `FROM_EMAIL` | `your-email@gmail.com` | Verified sender email (verified in SendGrid) |
| `FROM_NAME` | `Meeting Management Dashboard` | Sender name for emails |
| `DEFAULT_RECIPIENT_EMAIL` | `recipient@gmail.com` | Who receives reminder emails |
| `DEFAULT_RECIPIENT_NAME` | `Your Name` | Recipient name |
| `REMINDER_DAYS_THRESHOLD` | `7` | Include meetings within X days |
| `REMINDER_TIME_IST` | `08:00` | Time to send daily reminders (IST) |

**Note:** Use your actual values from `email_config.local.py` file on your computer.

### How to Add Each Variable

1. Click **"Add Environment Variable"**
2. Enter the **Key** (e.g., `SENDGRID_API_KEY`)
3. Enter the **Value** (e.g., your API key)
4. Click **"Save Changes"**
5. Repeat for all variables above

### Important Notes

- After adding variables, Render will automatically **redeploy** your service
- Wait 2-3 minutes for the deployment to complete
- The email features will work once deployment finishes

### Testing Email on Render

Once deployed with environment variables:

1. Visit your Render URL (e.g., `https://your-app.onrender.com`)
2. Click the **"Test Email"** button in the header
3. Check your inbox (`akshit.mahajan0703@gmail.com`)

### Verifying Environment Variables

To check if variables are set correctly:

1. Go to your Render dashboard
2. Click on your service
3. Go to **"Environment"** tab
4. You should see all 7 variables listed

### Troubleshooting

**Email not working?**
- Verify all environment variables are set
- Check that SendGrid API key is valid
- Ensure sender email is verified in SendGrid
- Check Render logs for errors (Logs tab)

**How to check logs:**
1. Go to your Render service
2. Click on **"Logs"** tab
3. Look for email-related errors

### Alternative: Test Without Email First

If you want to deploy without email features initially:
- Don't set the environment variables
- The app will work fine without email functionality
- You can add email features later by setting the variables

---

## Quick Setup Checklist

- [ ] Go to Render dashboard
- [ ] Select your web service
- [ ] Click "Environment" tab
- [ ] Add `SENDGRID_API_KEY` variable
- [ ] Add `FROM_EMAIL` variable
- [ ] Add `FROM_NAME` variable
- [ ] Add `DEFAULT_RECIPIENT_EMAIL` variable
- [ ] Add `DEFAULT_RECIPIENT_NAME` variable
- [ ] Add `REMINDER_DAYS_THRESHOLD` variable
- [ ] Add `REMINDER_TIME_IST` variable
- [ ] Wait for automatic redeployment
- [ ] Test email feature from dashboard

---

**That's it!** Your email features will now work on Render. 🎉
