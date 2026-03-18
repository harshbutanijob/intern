import { gql } from "@apollo/client";


export const LOGIN_USER = gql`
  query LoginUser($email: String!, $password: String!) {
    users(where: { email: { _eq: $email }, password: { _eq: $password } }) {
      id
      name
      email
      role
    }
  }
`;

// Fetch all interns
export const GET_INTERNS = gql`
  query GetAllInterns {
    interns {
      id
      name
      email
      college
      department
      phone_number
      start_date
    }
  }
`;

// Insert new intern
export const INSERT_INTERN = gql`
  mutation InsertIntern($name: String!, $email: String!, $college: String!, $department: String!, $phone_number: String!, $start_date: date!) {
    insert_interns_one(object: {name: $name, email: $email, college: $college, department: $department, phone_number: $phone_number, start_date: $start_date}) {
      id
      name
      email
    }
  }
`;

// Update intern
export const UPDATE_INTERN = gql`
  mutation UpdateIntern($id: Int!, $name: String!, $email: String!, $college: String!, $department: String!, $phone_number: String!, $start_date: date!) {
    update_interns_by_pk(pk_columns: {id: $id}, _set: {name: $name, email: $email, college: $college, department: $department, phone_number: $phone_number, start_date: $start_date}) {
      id
      name
      email
    }
  }
`;

// Delete intern
export const DELETE_INTERN = gql`
  mutation DeleteIntern($id: Int!) {
    delete_interns_by_pk(id: $id) {
      id
    }
  }
`;

export const GET_INTERN_BY_NAME = gql`
  query GetInternByName($name: String!) {
    interns(where: { name: { _eq: $name } }) {
      id
      name
      email
      college
      department
      phone_number
      start_date
      password
    }
  }
`;


export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      id
      name
      email
      role
    }
  }
`;

// Update user role
export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: Int!, $role: String!) {
    update_users_by_pk(pk_columns: { id: $id }, _set: { role: $role }) {
      id
      name
      email
      role
    }
  }
`;


export const GET_INTERNS_BY_DEPARTMENT = gql`
  query GetInternsByDepartment($department: String!) {
    interns(where: { department: { _eq: $department } }) {
      id
      name
      email
      college
      department
      phone_number
      start_date
    }
  }
`;

// Fetch intern by ID (for intern themselves)
export const GET_INTERN_BY_ID = gql`
  query GetInternByID($id: Int!) {
    interns(where: { id: { _eq: $id } }) {
      id
      name
      email
      college
      department
      phone_number
      start_date
    }
  }
`;