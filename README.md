# University_Management_System-Full_Stack

## How to start with this project?
## FirstAdmin Creation in the Admin Model

This README page provides instructions for creating the initial administrator (firstAdmin) in the Admin Model in this project. The code snippet provided in the comment section shows how to create this administrator and temporarily disable the creation code afterward. This README page serves as a guide for future reference.

## Creating the First Administrator

To create the first administrator (firstAdmin), you will need to use the provided code snippet. It utilizes the 'Admin' model and provides essential information such as the university, login ID, and password.

```javascript
// Creating a firstAdmin 
// Comment out after creating
const a = new Admin({ University : 'Madan Mohan Malaviya' , loginId : 'MadanMohanAdmin' , password : '112233' });
a.save();
```

The code snippet accomplishes the following:

1. **Creating an Admin Object**: It creates an instance of the 'Admin' model with the desired properties.
2. **Setting Admin Properties**: Replace the sample data with the specific information for your first administrator. You can customize the 'University', 'loginId', and 'password' fields according to your requirements.
3. **Saving the Admin Object**: The `a.save()` method saves the new administrator in your database.

After running this code snippet, you should have the first administrator created in your system.

## Important Notes

- **Security**: Ensure that you handle the initial admin's credentials securely. It is recommended to change the password immediately after the first login.
- **Code Commenting**: As indicated in the code snippet comments, it's crucial to comment out or remove this code after creating the initial admin. Leaving this code in your project can be a security risk.

After creating the first admin, remember to comment out or remove the code to prevent unauthorized access to this feature.
By following the steps outlined in this README, you'll have successfully created the first administrator for your project.
