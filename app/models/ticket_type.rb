# frozen_string_literal: true

# == Schema Information
#
# Table name: ticket_types
#
#  id                     :integer          not null, primary key
#  cost                   :float
#  currency               :string
#  name                   :string
#  dropzone_id            :integer          not null
#  altitude               :integer
#  allow_manifesting_self :boolean
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  is_tandem              :boolean          default(FALSE)
#
class TicketType < ApplicationRecord
  belongs_to :dropzone
  has_many :ticket_type_extras, dependent: :destroy
  has_many :extras, through: :ticket_type_extras
  has_many :slots
end
