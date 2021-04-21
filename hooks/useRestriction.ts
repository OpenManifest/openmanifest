import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useAppSelector } from "../redux";

const QUERY_PERMISSIONS = gql`
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

export default function useRestriction(permission: string): boolean {
  const { currentDropzone } = useAppSelector(state => state.global);
  const { data } = useQuery(QUERY_PERMISSIONS, {
    variables: {
      dropzoneId: Number(currentDropzone?.id)
    },
    fetchPolicy: "cache-first"
  });

  return data?.dropzone?.currentUser?.permissions?.includes(permission as any) || false;
}