import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service.js';
import { ToggleBookmarkDto } from './dto/toggle-bookmark.dto.js';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  // روت نشانک کردن / برداشتن نشانک (Toggle)
  @Post('toggle')
  toggleBookmark(@Body() toggleBookmarkDto: ToggleBookmarkDto) {
    return this.bookmarksService.toggleBookmark(toggleBookmarkDto);
  }

  // مشاهده نشانک‌های یک کاربر
  @Get(':userId')
  getUserBookmarks(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.bookmarksService.getUserBookmarks(userId);
  }
}
