import { UserRepository } from "../database/repositories/user.repository.ts";
import { TelegramService } from "../services/telegram.service.ts";
import { ImageUploadService } from "../services/image-upload.service.ts";
import { SubscriptionService } from "../services/subscription.service.ts";
import { 
  USE_DB, 
  WELCOME_IMAGE_URL, 
  DEVELOPER_ID 
} from "../config/config.ts";

export const BotController = {
  async handleUpdate(update: any): Promise<Response> {
    if (!update.message) return new Response("OK");

    const { chat, from, text, photo } = update.message;
    const chatId = chat.id;
    const userId = from.id;

    try {
      if (text === "/start") {
        if (USE_DB) await UserRepository.createUser(userId);
        
        // Send welcome message with inline keyboard
        await TelegramService.sendPhoto(
          chatId,
          WELCOME_IMAGE_URL,
          `<b>🖍️ Welcome to Image Link Bot!</b>\n\n` +
          `<i>Send me an image to get a shareable link</i>`,
          {
            inline_keyboard: [
              [{ 
                text: "Developer 🎾", 
                url: `tg://user?id=${DEVELOPER_ID}`
              }],
              [{
                text: "Join Channel 📢",
                url: "https://t.me/Private_Bots"
              }]
            ]
          }
        );
        return new Response("OK");
      }

      if (text === "/users") {
        const responseText = USE_DB
          ? `Total users: ${(await UserRepository.getAllUsers()).length}`
          : "📊 Database not configured";
        await TelegramService.sendMessage(chatId, responseText);
        return new Response("OK");
      }

      if (photo) {
        const hasAccess = await SubscriptionService.checkSubscription(chatId);
        if (!hasAccess) {
          await TelegramService.sendMessage(
            chatId,
            `<b>🔒 Premium Feature</b>\n\n` +
            `Join our channel to unlock this feature!\n\n` +
            `<a href="https://t.me/Private_Bots">👉 Click here to join</a>`,
            { disable_web_page_preview: true }
          );
          return new Response("OK");
        }

        const fileId = photo.pop().file_id;
        const imageUrl = await ImageUploadService.uploadImage(
          await (await fetch(await TelegramService.getFileUrl(fileId))).arrayBuffer()
        );

        await TelegramService.sendMessage(
          chatId, 
          imageUrl || "❌ Failed to upload image",
        );
        return new Response("OK");
      }

      await TelegramService.sendMessage(
        chatId,
        "📸 Send me an image to get started!\n\n" +
        "✨ Features:\n" +
        "- Convert images to direct links\n" +
        "- Shareable links\n" +
        "- Premium channel access",
        {
          reply_markup: {
            resize_keyboard: true,
            keyboard: [
              [{ text: "Join Channel 📢" }],
              [{ text: "Contact Developer 👨💻" }]
            ]
          }
        }
      );
    } catch (error) {
      console.error("Handler error:", error);
      await TelegramService.sendMessage(
        chatId,
        "⚠️ Oops! Something went wrong. Please try again."
      );
    }

    return new Response("OK");
  }
};