class Patchwork::UserServerSetting < ApplicationRecord
  belongs_to :user
  belongs_to :server_setting
end
