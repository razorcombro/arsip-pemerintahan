import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return {
      success: true,
      message: "API sehat",
      timestamp: new Date().toISOString()
    };
  }
}