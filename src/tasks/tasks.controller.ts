import { Controller, Get } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasksSevices: TasksService) {}

  @Get()
  getAllTasks() {
    this.tasksSevices.getAllTasks();
  }
}
