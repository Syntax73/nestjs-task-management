import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRespository } from './task.respository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockUser = { id: 12, username: 'Test user' };

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService: any;
  let taskRespository: any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRespository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRespository = await module.get<TaskRespository>(TaskRespository);
  });

  describe('getTasks', () => {
    it('gets all tasks from respository', async () => {
      taskRespository.getTasks.mockResolvedValue('someValue');

      expect(taskRespository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'some search query',
      };

      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRespository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRespository.findOne() and return a task', async () => {
      const mockTask = {
        title: 'Test title',
        description: 'Test description',
      };
      taskRespository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);

      expect(taskRespository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
          user: mockUser,
        },
      });
    });

    it('throws an error as task is not found', async () => {
      taskRespository.findOne.mockResolvedValue(null);
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('calls taskRespository.createTask() and returns the result', async () => {
      taskRespository.createTask.mockResolvedValue('task');
      expect(taskRespository.createTask).not.toHaveBeenCalled();

      const createTaskDto = { title: 'Task task', description: 'Task dec' };
      const result = await tasksService.createTask(createTaskDto, mockUser);

      expect(taskRespository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
      expect(result).toEqual('task');
    });
  });

  describe('removeTask', () => {
    it('call taskRespository.removeTask() to delete a task', async () => {
      taskRespository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRespository.delete).not.toHaveBeenCalled();

      await tasksService.removeTask(1, mockUser);
      expect(taskRespository.delete).toHaveBeenCalledWith({
        id: 1,
        user: mockUser,
      });
    });
    it('throws an error as task could not be found', () => {
      taskRespository.delete.mockResolvedValue({ affected: 0 });
      expect(tasksService.removeTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('update task status', async () => {
      const save = jest.fn().mockResolvedValue(true);

      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });

      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser,
      );
      expect(tasksService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});
