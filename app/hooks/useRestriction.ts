import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { Permission } from "../api/schema";
import { useAppSelector } from "../state";

export const QUERY_PERMISSIONS = gql`
query QueryPermissions($dropzoneId: Int!) {
    dropzone(id: $dropzoneId) {
      id
      name
      primaryColor
      secondaryColor
      
      currentUser {
        id
        role {
          id
          name
        }
        permissions
      }

    }
  }`;

export default function useRestriction(permission: Permission): boolean {
  const { currentDropzoneId } = useAppSelector(state => state.global);
  
  const { data } = useQuery(QUERY_PERMISSIONS, {
    variables: {
      dropzoneId: Number(currentDropzoneId)
    }
  });

  const permissions = data?.dropzone?.currentUser?.permissions || [];
  return permissions?.includes(permission as any) || false;
}