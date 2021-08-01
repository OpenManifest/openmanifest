# frozen_string_literal: true

module Mutations
  class CreateSlot < Mutations::BaseMutation
    field :slot, Types::SlotType, null: true
    field :errors, [String], null: true
    field :field_errors, [Types::FieldErrorType], null: true

    argument :attributes, Types::Input::SlotInput, required: true

    def resolve(attributes:)
      plane_load = Load.find(attributes[:load_id])
      dropzone = plane_load.plane.dropzone

      dz_user = DropzoneUser.find(attributes[:dropzone_user_id])
      model = Slot.find_or_initialize_by(
        dropzone_user: dz_user,
        load_id: attributes[:load_id],
      )
      model.assign_attributes(attributes.to_h.except(:passenger_name, :passenger_exit_weight))


      # Show errors if the dropzone is using credits
      # and the user doesn't have the funds for this slot
      if dropzone.is_credit_system_enabled?
        # Find extras
        extra_cost = Extra.where(
          dropzone: dropzone,
          id: attributes[:extra_ids],
        ).map(&:cost).reduce(&:sum)
        extra_cost ||= 0

        cost = model.ticket_type.cost + extra_cost

        credits = dz_user.credits || 0

        if cost > credits
          return {
            slot: nil,
            errors: ["Not enough credits to manifest for this jump"],
            field_errors: [
              { field: "credits", message: "Not enough credits to manifest for this jump" }
            ],
          }
        end
      end

      if model.ticket_type.is_tandem? && attributes[:passenger_name]
        if model.passenger_slot.present?
          model.passenger_slot.passenger.update(
            name: attributes[:passenger_name],
            exit_weight: attributes[:passenger_exit_weight],
          )
        else
          passenger = Passenger.find_or_create_by(
            name: attributes[:passenger_name],
            exit_weight: attributes[:passenger_exit_weight],
            dropzone: model.load.plane.dropzone
          )

          model.passenger_slot = Slot.create(
            load: model.load,
            passenger: passenger,
            exit_weight: attributes[:passenger_exit_weight],
            ticket_type: model.ticket_type,
            jump_type: model.jump_type,
          )
        end
      end

      model.save!

      {
        slot: model,
        errors: nil,
        field_errors: nil,
      }
    rescue ActiveRecord::RecordInvalid => invalid
      # Failed save, return the errors to the client
      {
        slot: nil,
        field_errors: invalid.record.errors.messages.map { |field, messages| { field: field, message: messages.first } },
        errors: invalid.record.errors.full_messages
      }
    rescue ActiveRecord::RecordNotSaved => error
      # Failed save, return the errors to the client
      {
        slot: nil,
        field_errors: nil,
        errors: error.record.errors.full_messages
      }
    rescue ActiveRecord::RecordNotFound => error
      {
        slot: nil,
        field_errors: nil,
        errors: [ error.message ]
      }
    end

    def authorized?(attributes: nil)
      dropzone = Load.find(attributes[:load_id]).plane.dropzone
      dz_user = context[:current_resource].dropzone_users.find_by(dropzone: dropzone)

      if attributes[:dropzone_user_id] != dz_user.id
        required_permission = "createUserSlot"
      else
        required_permission = "createSlot"
      end

      if dz_user.can?(required_permission)
        true
      else
        return false, {
          errors: [
            "You don't have permissions to manifest other users #{required_permission}"
            ]
          }
      end
    end
  end
end
