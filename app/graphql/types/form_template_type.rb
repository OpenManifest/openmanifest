# frozen_string_literal: true

module Types
  class FormTemplateType < Types::BaseObject
    field :id, GraphQL::Types::ID, null: false
    field :name, String, null: true
    field :definition, String, null: true
    field :created_at, Int, null: false
    field :updated_at, Int, null: false
  end
end
