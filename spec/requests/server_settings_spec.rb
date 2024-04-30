require 'rails_helper'

RSpec.describe "ServerSettings", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/server_settings/index"
      expect(response).to have_http_status(:success)
    end
  end

end
