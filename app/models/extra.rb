# frozen_string_literal: true

# == Schema Information
#
# Table name: extras
#
#  id          :integer          not null, primary key
#  cost        :float
#  name        :string
#  dropzone_id :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  is_deleted  :boolean          default(FALSE)
#
class Extra < ApplicationRecord
  has_many :ticket_type_extras, dependent: :destroy
  has_many :ticket_types, through: :ticket_type_extras
  belongs_to :dropzone

  has_many :ticket_type_extras
  has_many :ticket_types, through: :ticket_type_extras
end
