# frozen_string_literal: true

# == Schema Information
#
# Table name: slots
#
#  id                :integer          not null, primary key
#  ticket_type_id    :integer
#  load_id           :integer
#  rig_id            :integer
#  jump_type_id      :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  exit_weight       :float
#  passenger_id      :integer
#  is_paid           :boolean
#  transaction_id    :integer
#  passenger_slot_id :integer
#  group_number      :integer          default(0), not null
#  dropzone_user_id  :integer
#
require "test_helper"

class SlotTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end