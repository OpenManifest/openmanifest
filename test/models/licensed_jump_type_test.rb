# frozen_string_literal: true

# == Schema Information
#
# Table name: licensed_jump_types
#
#  id           :bigint           not null, primary key
#  license_id   :bigint           not null
#  jump_type_id :bigint           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
require "test_helper"

class LicensedJumpTypeTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
