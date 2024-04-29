require 'rails_helper'

RSpec.describe "UserServerSettings", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/user_server_settings/index"
      expect(response).to have_http_status(:success)
    end
  end

end
