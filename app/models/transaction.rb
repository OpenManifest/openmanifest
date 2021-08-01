# frozen_string_literal: true

# == Schema Information
#
# Table name: transactions
#
#  id               :integer          not null, primary key
#  dropzone_user_id :integer          not null
#  slot_id          :integer
#  status           :integer
#  amount           :float
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  message          :string
#
class Transaction < ApplicationRecord
  belongs_to :dropzone_user
  belongs_to :slot, optional: true
  has_many :notifications, as: :resource

  after_create :update_credits,
               :notify!
  before_destroy :refund!

  enum status: [
    :paid,
    :refunded,
    :deposit,
    :withdrawal,
    :reserved,
  ]

  def notify!
    if status == "deposit"
      Notification.create(
        received_by: dropzone_user,
        message: "Funds have been added to your account",
        resource: self
      )
    elsif status == "refunded"
      Notification.create(
        received_by: dropzone_user,
        message: "Funds have been refunded to your account",
        resource: self
      )
    elsif status == "paid"
      Notification.create(
        received_by: dropzone_user,
        message: "You paid $#{amount}",
        resource: self
      )
    end
  end

  def update_credits
    DropzoneUser.update_counters(
      dropzone_user_id,
      credits: amount
    )
  end

  def refund!
    DropzoneUser.update_counters(
      dropzone_user_id,
      credits: amount * -1
    )
  end
end