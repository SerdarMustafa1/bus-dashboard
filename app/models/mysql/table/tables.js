exports.table_create_email = `CREATE TABLE IF NOT EXISTS Email (
   email  VARCHAR(255) NOT NULL,
   isValid  BOOLEAN NOT NULL DEFAULT 0,

  PRIMARY KEY (email)
) ENGINE=InnoDB;`;

exports.table_create_city = `CREATE TABLE IF NOT EXISTS City (
   _id  VARCHAR(63),
   name  VARCHAR(255) NOT NULL UNIQUE,
   short  VARCHAR(255) NOT NULL UNIQUE,
   latitude  FLOAT NOT NULL,
   longitude  FLOAT NOT NULL,

  PRIMARY KEY (_id),
  INDEX (name),
  INDEX (short)
) ENGINE=InnoDB;`;

exports.table_create_user = `CREATE TABLE IF NOT EXISTS User (
   _id  VARCHAR(63),
   name  VARCHAR(127) NOT NULL,
   email  VARCHAR(127) NOT NULL UNIQUE,
   phone  VARCHAR(63),
   password  VARCHAR(127),
   passwordToken  VARCHAR(127),
   passwordTokenExpires  DATETIME,
   role  INT NOT NULL DEFAULT 0,
   city_id  VARCHAR(63),
   terms  BOOLEAN NOT NULL DEFAULT 0,
   created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   isDeleted  BOOLEAN NOT NULL DEFAULT 0,

  PRIMARY KEY (_id),
  INDEX (email),
  CONSTRAINT FK_UserCity FOREIGN KEY (city_id) REFERENCES City(_id)
) ENGINE=InnoDB;`;

exports.table_create_mail = `CREATE TABLE IF NOT EXISTS Mail (
   user_id  VARCHAR(63),
   mailCampCreated  BOOLEAN NOT NULL DEFAULT 1,
   mailCampChanged  BOOLEAN NOT NULL DEFAULT 1,
   mailPreStart  BOOLEAN NOT NULL DEFAULT 1,
   mailStart  BOOLEAN NOT NULL DEFAULT 1,
   mailPreEnd  BOOLEAN NOT NULL DEFAULT 1,
   mailEnd  BOOLEAN NOT NULL DEFAULT 1,
   mailInstallDone  BOOLEAN NOT NULL DEFAULT 1,
   mailRemoveDone  BOOLEAN NOT NULL DEFAULT 1,

  PRIMARY KEY (user_id),
  CONSTRAINT FK_MailUser FOREIGN KEY (user_id) REFERENCES User(_id)
) ENGINE=InnoDB;`;

exports.table_create_client = `CREATE TABLE IF NOT EXISTS Client (
   _id  VARCHAR(63),
   company  VARCHAR(255) NOT NULL,
   person  VARCHAR(127),
   email  VARCHAR(127),
   phone  VARCHAR(63),
   totalBudget  INT NOT NULL DEFAULT 0,
   isDeleted  BOOLEAN NOT NULL DEFAULT 0,
   created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (_id)
) ENGINE=InnoDB;`;

exports.table_create_place = `CREATE TABLE IF NOT EXISTS Place (
   _id  VARCHAR(63),
   name  VARCHAR(255) NOT NULL UNIQUE,
   isDeleted  BOOLEAN NOT NULL DEFAULT 0,

  PRIMARY KEY (_id)
) ENGINE=InnoDB;`;

exports.table_create_operator = `CREATE TABLE IF NOT EXISTS Operator (
   _id  VARCHAR(63),
   operatorId  VARCHAR(255) NOT NULL,
   company  VARCHAR(255),
   city_id  VARCHAR(63) NOT NULL,

  listed BOOLEAN NOT NULL DEFAULT 1,
  visible BOOLEAN NOT NULL DEFAULT 1,

  PRIMARY KEY (_id),
  CONSTRAINT FK_OperatorCity FOREIGN KEY (city_id) REFERENCES City(_id)
) ENGINE=InnoDB;`;

exports.table_create_vehicle = `CREATE TABLE IF NOT EXISTS Vehicle (
   _id          VARCHAR(63),
   numberPlate  VARCHAR(255),
   operator_id  VARCHAR(63) NOT NULL,
   city_id      VARCHAR(63) NOT NULL,

   line         VARCHAR(255) NOT NULL,
   latitude     FLOAT NOT NULL,
   longitude    FLOAT NOT NULL,

   totalAds INT NOT NULL DEFAULT 0,
   haveAds BOOLEAN NOT NULL DEFAULT 0,
   listed BOOLEAN NOT NULL DEFAULT 1,
   visible BOOLEAN NOT NULL DEFAULT 1,

   updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (_id),
  CONSTRAINT FK_VehicleCity FOREIGN KEY (city_id) REFERENCES City(_id),
  CONSTRAINT FK_VehicleListed FOREIGN KEY (city_id) REFERENCES City(_id),
  CONSTRAINT FK_VehicleVisible FOREIGN KEY (city_id) REFERENCES City(_id),
  CONSTRAINT FK_VehicleOperator FOREIGN KEY (operator_id) REFERENCES Operator(_id)
) ENGINE=InnoDB;`;

exports.table_create_campaign = `CREATE TABLE IF NOT EXISTS Campaign (
   _id  VARCHAR(63),
   name  VARCHAR(255) NOT NULL,
   client_id  VARCHAR(63) NOT NULL,
   creator_id  VARCHAR(63),
   budget  FLOAT NOT NULL,

   preStart  BOOLEAN NOT NULL DEFAULT 0,
   isStarted  BOOLEAN NOT NULL DEFAULT 0,
   preEnd  BOOLEAN NOT NULL DEFAULT 0,
   isEnded  BOOLEAN NOT NULL DEFAULT 0,

   startDate  DATETIME NOT NULL,
   endDate  DATETIME NOT NULL,

   isPublic  BOOLEAN NOT NULL DEFAULT 0,
   password VARCHAR(255),

   created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (_id),
  CONSTRAINT FK_CampaignClient FOREIGN KEY (client_id) REFERENCES Client(_id),
  CONSTRAINT FK_CampaignCreator FOREIGN KEY (creator_id) REFERENCES User(_id)
) ENGINE=InnoDB;`;

exports.table_create_campaignCity = `CREATE TABLE IF NOT EXISTS CampaignCity (
   campaign_id  VARCHAR(63),
   city_id  VARCHAR(63),

  PRIMARY KEY (campaign_id, city_id),
  CONSTRAINT FK_CampaignCity FOREIGN KEY (city_id) REFERENCES City(_id),
  CONSTRAINT FK_CityCampaign FOREIGN KEY (campaign_id) REFERENCES Campaign(_id)
) ENGINE=InnoDB;`;

exports.table_create_placement = `CREATE TABLE IF NOT EXISTS Placement (
   _id  VARCHAR(63),
   place_id  VARCHAR(63) NOT NULL,
   campaign_id  VARCHAR(63) NOT NULL,
   count  MEDIUMINT NOT NULL,
   isPublic  BOOLEAN NOT NULL DEFAULT 0,
   created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (_id),
  CONSTRAINT FK_PlacementPlace FOREIGN KEY (place_id) REFERENCES Place(_id),
  CONSTRAINT FK_PlacementCampaign FOREIGN KEY (campaign_id) REFERENCES Campaign(_id)
) ENGINE=InnoDB;`;

exports.table_create_team = `CREATE TABLE IF NOT EXISTS Team (
   _id  VARCHAR(63),
   company VARCHAR(255) NOT NULL,
   isDeleted BOOLEAN NOT NULL DEFAULT 0,
   created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (_id)
) ENGINE=InnoDB;`;

exports.table_create_installOrder = `CREATE TABLE IF NOT EXISTS InstallOrder (
   placement_id  VARCHAR(63) NOT NULL,
   team_id  VARCHAR(63) NOT NULL,
   campaign_id  VARCHAR(63) NOT NULL,
   count INT NOT NULL,
   installed INT NOT NULL DEFAULT 0,
   creator_id  VARCHAR(63) NOT NULL,
   is_installed BOOLEAN NOT NULL DEFAULT 0,
   is_removed BOOLEAN NOT NULL DEFAULT 1,
   created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (placement_id, team_id),
  
  CONSTRAINT FK_InstallOrderPlacement FOREIGN KEY (placement_id) REFERENCES Placement(_id),
  CONSTRAINT FK_InstallOrderCampaign FOREIGN KEY (campaign_id) REFERENCES Campaign(_id),
  CONSTRAINT FK_InstallOrderCreator FOREIGN KEY (creator_id) REFERENCES User(_id),
  CONSTRAINT FK_InstallOrderTeam FOREIGN KEY (team_id) REFERENCES Team(_id)
) ENGINE=InnoDB;`;

exports.table_create_picture = `CREATE TABLE IF NOT EXISTS Picture (
   id          INT NOT NULL AUTO_INCREMENT,
   campaign_id  VARCHAR(63) NOT NULL,
   user_id  VARCHAR(63),
   path  VARCHAR(255) NOT NULL,
   thumbnail  VARCHAR(255),
   created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE(path),
  CONSTRAINT FK_PictureCampaign FOREIGN KEY (campaign_id) REFERENCES Campaign(_id),
  CONSTRAINT FK_PictureUser FOREIGN KEY (user_id) REFERENCES User(_id) ON DELETE SET NULL
) ENGINE=InnoDB;`;

exports.table_create_installer = `CREATE TABLE IF NOT EXISTS Installer (
   _id  VARCHAR(63),
   team_id  VARCHAR(63),
   user_id  VARCHAR(63),
   isActive BOOLEAN NOT NULL DEFAULT 1,

   created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (_id),
  INDEX(team_id, user_id),
  CONSTRAINT FK_InstallerTeam FOREIGN KEY (team_id) REFERENCES Team(_id) ON DELETE SET NULL,
  CONSTRAINT FK_InstallerUser FOREIGN KEY (user_id) REFERENCES User(_id) ON DELETE SET NULL
) ENGINE=InnoDB;`;

exports.table_create_remove = `CREATE TABLE IF NOT EXISTS Remove (
   id          INT NOT NULL AUTO_INCREMENT,
   vehicle_id  VARCHAR(63) NOT NULL,
   placement_id  VARCHAR(63) NOT NULL,
   installer_id  VARCHAR(63) NOT NULL,
   campaign_id  VARCHAR(63) NOT NULL,
   count  SMALLINT NOT NULL,
   created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT FK_RemoveVehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle(_id),
  CONSTRAINT FK_RemoveInstaller FOREIGN KEY (installer_id) REFERENCES Installer(_id),
  CONSTRAINT FK_RemovePlacement FOREIGN KEY (placement_id) REFERENCES Placement(_id),
  CONSTRAINT FK_RemoveCampaign FOREIGN KEY (campaign_id) REFERENCES Campaign(_id)
) ENGINE=InnoDB;`;

exports.table_create_install = `CREATE TABLE IF NOT EXISTS Install (
   id          INT NOT NULL AUTO_INCREMENT,
   installer_id  VARCHAR(63) NOT NULL,
   vehicle_id  VARCHAR(63) NOT NULL,
   placement_id  VARCHAR(63) NOT NULL,
   team_id  VARCHAR(63) NOT NULL,
   campaign_id  VARCHAR(63) NOT NULL,

   count  SMALLINT NOT NULL,
   installed BOOLEAN NOT NULL DEFAULT 1,
   remove_id  INT,
   created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT FK_InstallInstaller FOREIGN KEY (installer_id) REFERENCES Installer(_id),
  CONSTRAINT FK_InstallTeam FOREIGN KEY (team_id) REFERENCES Team(_id),
  CONSTRAINT FK_InstallVehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle(_id),
  CONSTRAINT FK_InstallPlacement FOREIGN KEY (placement_id) REFERENCES Placement(_id),
  CONSTRAINT FK_InstallCampaign FOREIGN KEY (campaign_id) REFERENCES Campaign(_id),
  CONSTRAINT FK_InstallRemove FOREIGN KEY (remove_id) REFERENCES Remove(id)
) ENGINE=InnoDB;`;

exports.table_create_activity = `CREATE TABLE IF NOT EXISTS Activity (
   id  INT NOT NULL AUTO_INCREMENT,
   user1_id  VARCHAR(63),
   user2_id  VARCHAR(63),
   client_id  VARCHAR(63),
   campaign_id  VARCHAR(63),
   placement_id  VARCHAR(63),
   install_id  INT,
   remove_id  INT,
   operator_id  VARCHAR(63),
   vehicle_id  VARCHAR(63),
   team_id  VARCHAR(63),
   string1  VARCHAR(255),
   string2  VARCHAR(255),
   activityType  VARCHAR(255) NOT NULL,
   created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT FK_ActivityUser1 FOREIGN KEY (user1_id) REFERENCES User(_id) ON DELETE CASCADE,
  CONSTRAINT FK_ActivityUser2 FOREIGN KEY (user2_id) REFERENCES User(_id) ON DELETE CASCADE,
  CONSTRAINT FK_ActivityClient FOREIGN KEY (client_id) REFERENCES Client(_id),
  CONSTRAINT FK_ActivityCampaign FOREIGN KEY (campaign_id) REFERENCES Campaign(_id),
  CONSTRAINT FK_ActivityPlacement FOREIGN KEY (placement_id) REFERENCES Placement(_id),
  CONSTRAINT FK_ActivityInstall FOREIGN KEY (install_id) REFERENCES Install(id) ON DELETE CASCADE,
  CONSTRAINT FK_ActivityRemove FOREIGN KEY (remove_id) REFERENCES Remove(id),
  CONSTRAINT FK_ActivityOperator FOREIGN KEY (operator_id) REFERENCES Operator(_id),
  CONSTRAINT FK_ActivityTeam FOREIGN KEY (team_id) REFERENCES Team(_id),
  CONSTRAINT FK_ActivityVehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicle(_id)
) ENGINE=InnoDB;`;
