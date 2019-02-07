const chalk = require('chalk');
const packagejs = require('../../package.json');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            init(args) {
                if (args === 'default') {
                    // do something when argument is 'default'
                }
            },
            readConfig() {
                this.jhipsterAppConfig = this.getJhipsterAppConfig();
                if (!this.jhipsterAppConfig) {
                    this.error('Can\'t read .yo-rc.json');
                }
            },
            displayLogo() {
                // it's here to show that you can use functions from generator-jhipster
                // this function is in: generator-jhipster/generators/generator-base.js
                this.printJHipsterLogo();

                // Have Yeoman greet the user.
                this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster administration-database')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
            },
            checkJhipster() {
                const currentJhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
                const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
                if (!semver.satisfies(currentJhipsterVersion, minimumJhipsterVersion)) {
                    this.warning(`\nYour generated project used an old JHipster version (${currentJhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`);
                }
            }
        };
    }

    writing() {
        // function to use directly template
        this.template = function (source, destination) {
            this.fs.copyTpl(
                this.templatePath(source),
                this.destinationPath(destination),
                this
            );
        };

        // read config from .yo-rc.json
        this.baseName = this.jhipsterAppConfig.baseName;

        var database = ''
        var fs = require('fs');
        var content = fs.readFileSync('.yo-rc.json');
        var contentArray = JSON.parse(content);
        database = contentArray['generator-jhipster'].prodDatabaseType;

	switch(database){
	  case 'mysql': this.log('Your current production database is : '+database);
          var appName = this.baseName.toLowerCase() + '-mysql';

          fs.appendFileSync(jhipsterConstants.DOCKER_DIR+'mysql.yml', `    phpmyadmin:
        image: phpmyadmin/phpmyadmin
        depends_on:
            - ${appName}
        ports:
            - 8090:80
        links:
            - ${appName}
        environment:
            PMA_HOSTS: ${appName}`);

			break;
	  case 'postgresql': this.log('Your current production database is : '+database);
          var appName = this.baseName.toLowerCase() + '-postgresql';
          fs.appendFileSync(jhipsterConstants.DOCKER_DIR+'postgresql.yml', `    pgadmin:
        links:
          - ${appName}
        image: dpage/pgadmin4
        environment:
          PGADMIN_DEFAULT_EMAIL: test@gmail.com
          PGADMIN_DEFAULT_PASSWORD: SUPER_SECRET_TO_CHANGE
        ports:
          - 3080:80`);
			break;
    case 'mongodb': this.log('Your current production database is : '+database);
          var appName = this.baseName.toLowerCase() + '-mongodb';
          fs.appendFileSync(jhipsterConstants.DOCKER_DIR+'mongodb.yml', `    mongodbmyadmin:
        image: 'mongoclient/mongoclient'
        links:
          - ${appName}
        ports:
          - 3000:3000
        environment:
          - STARTUP_DELAY=3
          - MONGO_URL=mongodb://${appName}:27017
        volumes:
          - ./mongodbclient:/data/db`);
  		break;
      case 'mariadb': this.log('Your current production database is : '+database);
            var appName = this.baseName.toLowerCase() + '-mariadb';
            fs.appendFileSync(jhipsterConstants.DOCKER_DIR+'mariadb.yml', `    phpmyadmin:
          image: phpmyadmin/phpmyadmin
          depends_on:
              - ${appName}
          ports:
              - 8090:80
          links:
              - ${appName}
          environment:
              PMA_HOSTS: ${appName}`);
        break;
	  default: this.warnig(`\n Your database is not supported yet ! :(`);

	}

    }

    install() {
        let logMsg =
            `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

        if (this.clientFramework === 'angular1') {
            logMsg =
                `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install & bower install`)}`;
        }
        const injectDependenciesAndConstants = (err) => {
            if (err) {
                this.warning('Install of dependencies failed!');
                this.log(logMsg);
            } else if (this.clientFramework === 'angular1') {
                this.spawnCommand('gulp', ['install']);
            }
        };
        const installConfig = {
            bower: this.clientFramework === 'angular1',
            npm: this.clientPackageManager !== 'yarn',
            yarn: this.clientPackageManager === 'yarn',
            callback: injectDependenciesAndConstants
        };
        if (this.options['skip-install']) {
            this.log(logMsg);
        } else {
            this.installDependencies(installConfig);
        }
    }

    end() {
        this.log('End of administration-database generator');
    }
};
