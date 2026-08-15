import { Webhook } from "svix";
import User from "../models/User_model.js";

export const clerkWebhooks = async (req, res) => {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        const svixHeaders = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };

        const payload = req.body.toString();

        const evt = whook.verify(payload, svixHeaders);

        const { data, type } = evt;

        switch (type) {

            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    imageUrl: data.image_url
                };

                await User.create(userData);

                res.json({
                    success: true,
                    message: "User created"
                });

                break;
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
                    imageUrl: data.image_url
                };

                await User.findByIdAndUpdate(data.id, userData);

                res.json({
                    success: true,
                    message: "User updated"
                });

                break;
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);

                res.json({
                    success: true,
                    message: "User deleted"
                });

                break;
            }

            default: {
                res.json({
                    success: true,
                    message: "Event ignored"
                });

                break;
            }
        }

    } catch (error) {
        console.error("Clerk Webhook Error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};