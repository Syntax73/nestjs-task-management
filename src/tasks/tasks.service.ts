import { Injectable } from '@nestjs/common';

@Injectable()
export class TasksService {
  private tasks = [];

  getAllTasks(): Array<any> {
    return this.tasks;
  }
}
