mock_provider "aws" {}

variables {
  project              = "devops-e2e"
  environment          = "test"
  vpc_cidr             = "10.9.0.0/16"
  azs                  = ["ap-south-1a", "ap-south-1b"]
  public_subnet_cidrs  = ["10.9.0.0/24", "10.9.1.0/24"]
  private_subnet_cidrs = ["10.9.10.0/24", "10.9.11.0/24"]
}

run "creates_one_vpc" {
  command = plan

  module {
    source = "./modules/vpc"
  }

  assert {
    condition     = aws_vpc.this.cidr_block == var.vpc_cidr
    error_message = "VPC CIDR block does not match input variable"
  }
}

run "creates_matching_subnet_counts" {
  command = plan

  module {
    source = "./modules/vpc"
  }

  assert {
    condition     = length(aws_subnet.public) == length(var.public_subnet_cidrs)
    error_message = "Number of public subnets does not match public_subnet_cidrs"
  }

  assert {
    condition     = length(aws_subnet.private) == length(var.private_subnet_cidrs)
    error_message = "Number of private subnets does not match private_subnet_cidrs"
  }
}

run "public_subnets_map_public_ip" {
  command = plan

  module {
    source = "./modules/vpc"
  }

  assert {
    condition     = alltrue([for s in aws_subnet.public : s.map_public_ip_on_launch])
    error_message = "All public subnets must auto-assign public IPs"
  }
}

run "private_subnets_do_not_map_public_ip" {
  command = plan

  module {
    source = "./modules/vpc"
  }

  assert {
    condition     = alltrue([for s in aws_subnet.private : s.map_public_ip_on_launch != true])
    error_message = "Private subnets must not auto-assign public IPs"
  }
}
