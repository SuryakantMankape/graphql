import { Component, OnInit } from '@angular/core';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, filter, map } from 'rxjs';
import { Router } from '@angular/router';

/** 🔹 Types */
interface Task {
  id: string;
  title: string;
  status: string;
  userId: string;
}

interface GetTasksResponse {
  tasks: Task[];
}

interface GetTasksVars {
  limit: number;
  offset: number;
}

/** 🔹 Fragment */
const TASK_FIELDS = gql`
  fragment TaskFields on Task {
    id
    title
    status
    userId
  }
`;

/** 🔹 Queries & Mutations */
const GET_TASKS = gql`
  query ($limit: Int, $offset: Int) {
    tasks(limit: $limit, offset: $offset) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

const CREATE_TASK = gql`
  mutation ($title: String!) {
    createTask(title: $title) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

const UPDATE_TASK_STATUS = gql`
  mutation ($taskId: ID!, $status: TaskStatus!) {
    updateTaskStatus(taskId: $taskId, status: $status) {
      ...TaskFields
    }
  }
  ${TASK_FIELDS}
`;

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task.html',
  styleUrls: ['./task.css']
})
export class TaskComponent implements OnInit {

  tasks$!: Observable<Task[]>;
  private tasksQuery!: QueryRef<GetTasksResponse, GetTasksVars>;

  title = '';
  user: any;

  limit = 10;
  offset = 0;

  constructor(private apollo: Apollo, private router: Router) {
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  ngOnInit() {
  const raw =
  typeof window !== 'undefined'
    ? localStorage.getItem('user')
    : null;

    if (!raw) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = JSON.parse(raw);

    /** 🔹 watchQuery created ONCE */
    this.tasksQuery = this.apollo.watchQuery<GetTasksResponse, GetTasksVars>({
      query: GET_TASKS,
      variables: {
        limit: this.limit,
        offset: this.offset
      },
      fetchPolicy: 'network-only'
    });

this.tasks$ = this.tasksQuery.valueChanges.pipe(
  map(res => (res.data?.tasks ?? []).filter((t): t is Task => !!t))
);

const adminClient = this.apollo.use('admin');

if (adminClient) {
  console.log('Admin Apollo client is configured');
} else {
  console.log('Admin Apollo client not instantiated yet');
}


  }

  logout() {
    localStorage.removeItem('user');
    this.apollo.client.clearStore();
    this.router.navigate(['/login']);
  }

  addTask() {
    if (!this.title.trim()) return;

    this.apollo.mutate({
      mutation: CREATE_TASK,
      variables: { title: this.title }
    }).subscribe(() => {
      this.title = '';
      this.tasksQuery.refetch();
    });
  }

  markDone(taskId: string) {
    this.apollo.mutate({
      mutation: UPDATE_TASK_STATUS,
      variables: {
        taskId,
        status: 'DONE'
      }
    }).subscribe(() => {
      this.tasksQuery.refetch();
    });
  }

  nextPage() {
    this.offset += this.limit;
    this.tasksQuery.refetch({
      limit: this.limit,
      offset: this.offset
    });
  }

  prevPage() {
    if (this.offset === 0) return;

    this.offset -= this.limit;
    this.tasksQuery.refetch({
      limit: this.limit,
      offset: this.offset
    });
  }
}
